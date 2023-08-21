import { getShaderSource } from './shader_loader.js';

const vertShaderCode = await getShaderSource('./shaders/vert.wgsl');
const fragShaderCode = await getShaderSource('./shaders/frag.wgsl');

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu");
const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format });

console.error(vertShaderCode);

const pipeline = device.createRenderPipeline({
  layout: "auto",
  vertex: {
    module: device.createShaderModule({code: vertShaderCode}),
    entryPoint: "main",
  },
  fragment: {
    module: device.createShaderModule({code: fragShaderCode}),
    entryPoint: "main",
    targets: [{ format }],
  },
});
const commandEncoder = device.createCommandEncoder();
const colorAttachments = [
  {
    view: context.getCurrentTexture().createView(),
    loadOp: "clear",
    storeOp: "store",
  },
];
const passEncoder = commandEncoder.beginRenderPass({ colorAttachments });
passEncoder.setPipeline(pipeline);
passEncoder.draw(3);
passEncoder.end();
device.queue.submit([commandEncoder.finish()]);