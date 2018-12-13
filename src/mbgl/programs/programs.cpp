#include <mbgl/programs/programs.hpp>

#include <mbgl/programs/background_program.hpp>
#include <mbgl/programs/circle_program.hpp>
#include <mbgl/programs/heatmap_program.hpp>
#include <mbgl/programs/hillshade_program.hpp>
#include <mbgl/programs/fill_extrusion_program.hpp>
#include <mbgl/programs/fill_program.hpp>
#include <mbgl/programs/line_program.hpp>
#include <mbgl/programs/raster_program.hpp>
#include <mbgl/programs/symbol_program.hpp>

#define MBGL_DEFINE_GET_LAYER_PROGRAMS(ProgramsType, property)                 \
ProgramsType& Programs::get##ProgramsType() {                                  \
    if (!property) {                                                           \
        property = std::make_unique<ProgramsType>(context, programParameters); \
    }                                                                          \
    return static_cast<ProgramsType&>(*property);                                                          \
}

namespace mbgl {

Programs::Programs(gl::Context& context_, const ProgramParameters& programParameters_)
    : debug(context_, programParameters_),
      clippingMask(context_, programParameters_),
      context(context_),
      programParameters(std::move(programParameters_)) {
}

Programs::~Programs() = default;

MBGL_DEFINE_GET_LAYER_PROGRAMS(BackgroundLayerPrograms, backgroundPrograms)
MBGL_DEFINE_GET_LAYER_PROGRAMS(RasterLayerPrograms, rasterPrograms)
MBGL_DEFINE_GET_LAYER_PROGRAMS(HeatmapLayerPrograms, heatmapPrograms)
MBGL_DEFINE_GET_LAYER_PROGRAMS(HillshadeLayerPrograms, hillshadePrograms)
MBGL_DEFINE_GET_LAYER_PROGRAMS(FillLayerPrograms, fillPrograms)
MBGL_DEFINE_GET_LAYER_PROGRAMS(FillExtrusionLayerPrograms, fillExtrusionPrograms)
MBGL_DEFINE_GET_LAYER_PROGRAMS(CircleLayerPrograms, circlePrograms)
MBGL_DEFINE_GET_LAYER_PROGRAMS(LineLayerPrograms, linePrograms)
MBGL_DEFINE_GET_LAYER_PROGRAMS(SymbolLayerPrograms, symbolPrograms)

} // namespace mbgl
