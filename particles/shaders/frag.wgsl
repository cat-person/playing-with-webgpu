// width, height in pixels
// @group(0)
// @binding(0)
// var<uniform> image_size: vec2u;

// @group(1)
// @binding(0)
// var<storage, read_write> pixels: array<u32>;

// @builtin(global_invocation_id) global_id : vec3<u32>

@fragment 
fn main() -> @location(0) vec4f {
    // let aspect_ratio = f32(800) / f32(600);
    // let viewport_size = vec2f(aspect_ratio, 1.0) * 3.5;
    // let step = viewport_size / vec2f(800, 600);

    // // id.xy
    // let pos = vec2f(global_id.xy) * step - viewport_size / 2.0;
    // var z = pos;
    // var i = 254u;

    // while !oob(z, viewport_size) && i > 0u {
    //     i -= 1u;
    //     z = square(z) + pos;
    // }

    // if(i == 0) {
    //     return vec4f(0.8,0.8,0.8,1);
    // } else {
    //     return vec4f(0.1,0.1,0.1,1);
    // }
    return vec4f(0.8,0.8,0.8,1);
}

fn square(c: vec2f) -> vec2f {
    // (a+bi)(a+bi) = aa - bb + 2abi
    return vec2f(
        c.x * c.x - c.y * c.y,
        2f * c.x * c.y,
    );
}

fn oob(c: vec2f, viewport_size: vec2f) -> bool {
    return abs(c.x) > viewport_size.x / 2f || abs(c.y) > viewport_size.y / 2f;
}