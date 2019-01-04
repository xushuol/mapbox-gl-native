package com.mapbox.mapboxsdk.location;

import android.animation.TypeEvaluator;
import android.support.annotation.NonNull;

import com.mapbox.mapboxsdk.geometry.LatLng;

class MapboxLatLngAnimator extends MapboxAnimator<LatLng> {

  MapboxLatLngAnimator(LatLng previous, LatLng target, AnimationsValueChangeListener updateListener,
                       MapboxAnimatorOptions mapboxAnimatorOptions) {
    super(previous, target, updateListener, mapboxAnimatorOptions);
  }

  @NonNull
  @Override
  TypeEvaluator provideEvaluator() {
    return new LatLngEvaluator();
  }
}
