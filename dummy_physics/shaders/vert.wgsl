struct VsInput {
    centerX: f32,
    centerY: f32,
    width: f32,
    height: f32,
}

@group(0) @binding(0) var<uniform> vsInput: VsInput;

@vertex
fn main(@builtin(vertex_index) idx : u32) -> @builtin(position) vec4f {
    var data = array<vec2<f32>, 6>(
        vec2<f32>(vsInput.centerX - vsInput.width / 2.0, vsInput.centerY - vsInput.height / 2.0),
        vec2<f32>(vsInput.centerX + vsInput.width / 2.0, vsInput.centerY - vsInput.height / 2.0),
        vec2<f32>(vsInput.centerX - vsInput.width / 2.0, vsInput.centerY + vsInput.height / 2.0),

        vec2<f32>(vsInput.centerX - vsInput.width / 2.0, vsInput.centerY + vsInput.height / 2.0),
        vec2<f32>(vsInput.centerX + vsInput.width / 2.0, vsInput.centerY - vsInput.height / 2.0),
        vec2<f32>(vsInput.centerX + vsInput.width / 2.0, vsInput.centerY + vsInput.height / 2.0),
    );

    // var data = array<vec2<f32>, 6>(
    //     vec2<f32>(-0.1, -0.1),
    //     vec2<f32>(0.1, -0.1),
    //     vec2<f32>(-0.1, 0.1),
    //     vec2<f32>(-0.1, 0.1),
    //     vec2<f32>(0.1, -0.1),
    //     vec2<f32>(0.1, 0.1),
    // );

    return vec4f(data[idx], 0.0, 1.0);
}
