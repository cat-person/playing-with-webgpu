@vertex 
fn main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    let pos = array(
        vec2f( 0.0,  0.9),  // top center
        vec2f(-0.9, -0.9),  // bottom left
        vec2f( 0.9, -0.9)   // bottom right
    );

    return vec4f(pos[vertexIndex], 0.0, 1.0);
}