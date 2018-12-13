#pragma once

#include <mbgl/programs/clipping_mask_program.hpp>
#include <mbgl/programs/debug_program.hpp>
#include <mbgl/programs/program_parameters.hpp>
#include <memory>

namespace mbgl {

class BackgroundLayerPrograms;

class CircleLayerPrograms;
class RasterLayerPrograms;
class HeatmapLayerPrograms;
class HillshadeLayerPrograms;
class FillLayerPrograms;
class FillExtrusionLayerPrograms;
class LineLayerPrograms;
class SymbolLayerPrograms;

class Programs {
public:
    Programs(gl::Context&, const ProgramParameters&);
    ~Programs();

    BackgroundLayerPrograms& getBackgroundLayerPrograms();
    RasterLayerPrograms& getRasterLayerPrograms();
    HeatmapLayerPrograms& getHeatmapLayerPrograms();
    CircleLayerPrograms& getCircleLayerPrograms();
    HillshadeLayerPrograms& getHillshadeLayerPrograms();
    FillLayerPrograms& getFillLayerPrograms();
    FillExtrusionLayerPrograms& getFillExtrusionLayerPrograms();
    LineLayerPrograms& getLineLayerPrograms();
    SymbolLayerPrograms& getSymbolLayerPrograms();

    DebugProgram debug;
    ClippingMaskProgram clippingMask;

private:
    std::unique_ptr<LayerTypePrograms> backgroundPrograms;
    std::unique_ptr<LayerTypePrograms> circlePrograms;
    std::unique_ptr<LayerTypePrograms> rasterPrograms;
    std::unique_ptr<LayerTypePrograms> heatmapPrograms;
    std::unique_ptr<LayerTypePrograms> hillshadePrograms;
    std::unique_ptr<LayerTypePrograms> fillPrograms;
    std::unique_ptr<LayerTypePrograms> fillExtrusionPrograms;
    std::unique_ptr<LayerTypePrograms> linePrograms;
    std::unique_ptr<LayerTypePrograms> symbolPrograms;

    gl::Context& context;
    ProgramParameters programParameters;
};

} // namespace mbgl
