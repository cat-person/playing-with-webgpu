import { getShaderSource } from "../common/shader_loader.js";
const shaderCode = await getShaderSource("./shaders/shader.wgsl");

async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail("need a browser that supports WebGPU");
    return;
  }

  // Get a WebGPU context from the canvas and configure it
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("webgpu");
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

  let centerX = 0.0;
  let centerY = 0.2;
  let width = 0.6;
  let height = 0.4;

  context.configure({
    device,
    format: presentationFormat,
  });

  const shaderModule = device.createShaderModule({ code: shaderCode });

  const pipeline = device.createRenderPipeline({
    label: "triangle with uniforms",
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vs",
      targets: [{ format: presentationFormat }],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fs",
      targets: [{ format: presentationFormat }],
    },
  });

  const renderPassDescriptor = {
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        // view: <- to be filled out when we render
        clearValue: [1.0, 0.2, 0.35, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  render(
    centerX,
    centerY,
    width,
    height,
    device,
    context,
    pipeline,
    renderPassDescriptor,
  );
}

function render(
  centerX,
  centerY,
  width,
  height,
  device,
  context,
  pipeline,
  renderPassDescriptor,
) {
  const uniformBufferSize = 32; // offset is 2 32bit floats (4bytes each)
  const uniformBuffer = device.createBuffer({
    label: "uniforms scroll params",
    size: uniformBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  // create a typedarray to hold the values for the uniforms in JavaScript
  const uniformValues = new Float32Array(uniformBufferSize / 4);

  uniformValues.set([centerX, centerY], 0);
  uniformValues.set([width, height], 2);
  uniformValues.set([0.3, 0.3, 0.3, 1.0], 4); // Color rgba

  // copy the values from JavaScript to the GPU
  device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

  const bindGroup = device.createBindGroup({
    label: "triangle bind group",
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  // Get the current texture from the canvas context and
  // set it as the texture to render to.
  renderPassDescriptor.colorAttachments[0].view = context
    .getCurrentTexture()
    .createView();

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass(renderPassDescriptor);
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(3); // call our vertex shader 3 times
  pass.end();

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}

main();
