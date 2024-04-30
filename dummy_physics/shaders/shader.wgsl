struct Data {
    center: vec2f,
    dimens: vec2f,
    color: vec4f,
};

@group(0) @binding(0) var<storage, read> data: Data;

@vertex fn vs(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    let pos = array(
        vec2f( 0.0,  0.5),  // top center
        vec2f(-0.5, -0.5),  // bottom left
        vec2f( 0.5, -0.5)   // bottom right
    );

    return vec4f(pos[vertexIndex] * data.dimens + data.center, 0.0, 1.0);
}

@fragment fn fs() -> @location(0) vec4f {
    return data.color;
}
