struct FsInput {
    @builtin(position) position: vec4f,
}

@fragment 
fn main(fsInput: FsInput) -> @location(0) vec4f {
    let pos = vec2f(
        (fsInput.position[0] - 450.0) / 200.0, 
        (fsInput.position[1] - 400.0) / 200.0);

    var z = pos;
    var i = 254u;

    while !oob(z) && i > 0u {
        i -= 1u;
        z = square(z) + pos;
    }

    if(i == 0) {
        return vec4f(0.8,0.8,0.8,1);
    } else {
        return vec4f(0.1,0.13,0.2,1);
    }
}

fn square(c: vec2f) -> vec2f {
    // (a+bi)(a+bi) = aa - bb + 2abi
    return vec2f(
        c.x * c.x - c.y * c.y,
        2f * c.x * c.y,
    );
}

fn oob(c: vec2f) -> bool {
    return abs(c.x) > 2f || abs(c.y) > 2f;
}