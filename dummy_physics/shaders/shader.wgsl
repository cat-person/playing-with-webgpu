struct Data {
    screenDimens: vec2f,
    center: vec2f,
    dimens: vec2f,
    color: vec4f,
};

@group(0) @binding(0) var<storage, read> data: Data;

@vertex fn vs(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    let pos = array(
        vec2f(-0.5,-0.5),  // left top
        vec2f( 0.5,-0.5),  // right top
        vec2f(-0.5,0.5),   // left bottom

        vec2f(-0.5, 0.5),   // left bottom
        vec2f(0.5, -0.5),  // right top
        vec2f(0.5, 0.5),  // right bottom
    );

    return vec4f(pos[vertexIndex] * data.dimens + data.center, 0.0, 1.0);
}

struct FsInput {
    @builtin(position) position: vec4f,
}

@fragment fn fs(fsInput: FsInput) -> @location(0) vec4f {
    return vec4f(fsInput.position.x / data.screenDimens.x, fsInput.position.y / data.screenDimens.y, 0.5, 1.0);
}
