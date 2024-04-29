struct FsInput {
    @builtin(position) position: vec4f,
}



@fragment
fn main(fsInput: FsInput) -> @location(0) vec4f {
    return vec4f(0.1, 0.1, 0.1, 1);
}
