package com.mapbox.mapboxsdk.location;

class MapboxAnimatorOptions {
  private final double mapZoomLevel;
//  private final double metersPerPixelAtLatitude;

  public MapboxAnimatorOptions(double mapZoomLevel) {
    this.mapZoomLevel = mapZoomLevel;
//    this.metersPerPixelAtLatitude = metersPerPixelAtLatitude;
  }

  public double getMapZoomLevel() {
    return mapZoomLevel;
  }

//  public double getMetersPerPixelAtLatitude() {
//    return metersPerPixelAtLatitude;
//  }
}
