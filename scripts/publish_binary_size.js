#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const github = require('@octokit/rest')();
const zlib = require('zlib');
const AWS = require('aws-sdk');

const SIZE_CHECK_APP_ID = 14028;
const SIZE_CHECK_APP_INSTALLATION_ID = 229425;

process.on('unhandledRejection', error => {
    console.log(error);
    process.exit(1)
});

const pk = process.env['SIZE_CHECK_APP_PRIVATE_KEY'];
if (!pk) {
    console.log('Fork PR; not publishing size.');
    process.exit(0);
}

const key = Buffer.from(pk, 'base64').toString('binary');
const payload = {
    exp: Math.floor(Date.now() / 1000) + 60,
    iat: Math.floor(Date.now() / 1000),
    iss: SIZE_CHECK_APP_ID
};

const token = jwt.sign(payload, key, {algorithm: 'RS256'});
github.authenticate({type: 'app', token});

// Must be in sync with the definition in metrics/binary-size/index.html on the gh-pages branch.
const platforms = [
    { 'platform': 'iOS', 'arch': 'armv7' },
    { 'platform': 'iOS', 'arch': 'arm64' },
    { 'platform': 'Android', 'arch': 'arm-v7' },
    { 'platform': 'Android', 'arch': 'arm-v8' },
    { 'platform': 'Android', 'arch': 'x86' },
    { 'platform': 'Android', 'arch': 'x86_64' }
];

const date = new Date();
const rows = [];
var metricsPayload = [];

function query(after) {
    return github.request({
        method: 'POST',
        url: '/graphql',
        headers: {
            // https://developer.github.com/changes/2018-07-11-graphql-checks-preview/
            accept: 'application/vnd.github.antiope-preview'
        },
        query: `query {
              repository(owner: "mapbox", name: "mapbox-gl-native") {
                ref(qualifiedName: "master") {
                  target {
                    ... on Commit {
                      history(first: 100, before: "36c6a8ea79bbd2596abb58ffb58debf65a4ea13d" ${after ? `, after: "${after}"` : ''}) {
                        pageInfo {
                          hasNextPage
                          endCursor
                        }
                        edges {
                          node {
                            oid
                            messageHeadline
                            checkSuites(first: 1, filterBy: {appId: ${SIZE_CHECK_APP_ID}}) {
                              nodes {
                                checkRuns(first: 10) {
                                  nodes {
                                    name
                                    conclusion
                                    title
                                    summary
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }`
    }).then((result) => {
        const history = result.data.data.repository.ref.target.history;
        const lastCommitSizeChecks = history.edges[0].node.checkSuites.nodes[0].checkRuns.nodes;

        for (const edge of history.edges) {
            const commit = edge.node;
            const suite = commit.checkSuites.nodes[0];

            if (!suite)
                continue;

            // Build source data for http://mapbox.github.io/mapbox-gl-native/metrics/binary-size/
            createChartSourceData(commit);
        }

        if (history.pageInfo.hasNextPage) {
            return query(history.pageInfo.endCursor);
        } else {
          
          // Send result of binary size checks of last commit to S3
          const binaryMetrics = [];
          
          lastCommitSizeChecks.forEach(function(binarySize) {
            binaryMetrics.push(JSON.stringify(formatBinaryMetric(binarySize)))
          });

          var payload = binaryMetrics.join("\n")

          var params = {
              Body: zlib.gzipSync(binaryMetrics),
              Bucket: 'mapbox-loading-dock',
              Key: `raw/mobile_tmp.binary_size/${process.env['CIRCLE_SHA1']}.json`,
              CacheControl: 'max-age=300',
              ContentEncoding: 'gzip',
              ContentType: 'application/json'
          };
          
          return new AWS.S3({region: 'us-east-1'}).putObject(params, function (err, res) {
            if (err) {
              console.log("Error sending publishing metrics: ", err);
            } else {
              console.log("Binary size logged to S3 successfully")
            }
          });
        }
    });
}

function createChartSourceData(commit) {
  const runs = commit.checkSuites.nodes[0].checkRuns.nodes;
  const row = [`${commit.oid.slice(0, 7)} - ${commit.messageHeadline}`];
  
  for (let i = 0; i < platforms.length; i++) {
      const {platform, arch} = platforms[i];

      const run = runs.find((run) => {
          const [, p, a] = run.name.match(/Size - (\w+) ([\w-]+)/);
          return platform === p && arch === a;
      });

      row[i + 1] = run ? +run.summary.match(/is (\d+) bytes/)[1] : undefined;
  }
  rows.push(row);
}

function formatBinaryMetric(item) {
  var platform = item["name"].includes("iOS") ? 'iOS' : 'Android';
  var arch;
  var size = item["title"].replace(/ MB/g,'');

  switch(true) {
    case item["name"].includes("arm-v7") || item["name"].includes("armv7"):
      arch = "arm-v7";
      break;
    case item["name"].includes("arm-v8"):
      arch = "arm-v8";
      break;
    case item["name"].includes("x86"):
      arch = "x86";
      break;
    case item["name"].includes("x86_64"):
      arch = "x86_64";
      break;
    case item["name"].includes("AAR"):
      arch = "AAR";
      break;
    case item["name"].includes("arm64"):
      arch = "arm64";
      break;
    case item["name"].includes("Dynamic"):
      arch = "Dynamic";
      break;
  }
  
  return {
      'sdk': 'maps',
      'platform' : platform,
      'arch': arch,
      'size' : size,
      'commit': `${process.env['CIRCLE_SHA1']}`,
      'created_at': `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
  };
}

github.apps.createInstallationToken({installation_id: SIZE_CHECK_APP_INSTALLATION_ID})
    .then(({data}) => {
        github.authenticate({type: 'token', token: data.token});
        return query();
    });
