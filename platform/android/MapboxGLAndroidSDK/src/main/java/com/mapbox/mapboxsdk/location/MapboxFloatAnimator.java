package com.mapbox.mapboxsdk.location;

import android.animation.FloatEvaluator;
import android.animation.TypeEvaluator;
import android.support.annotation.NonNull;

class MapboxFloatAnimator extends MapboxAnimator<Float> {
  MapboxFloatAnimator(Float previous, Float target, AnimationsValueChangeListener updateListener,
                      MapboxAnimatorOptions mapboxAnimatorOptions) {
    super(previous, target, updateListener, mapboxAnimatorOptions);
  }

  @NonNull
  @Override
  TypeEvaluator provideEvaluator() {
    return new FloatEvaluator();
  }
}
