import { getShaderSource } from '../common/shader_loader.js';

const vertShaderCode = await getShaderSource('./shaders/vert.wgsl');
const fragShaderCode = await getShaderSource('./shaders/frag.wgsl');

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu");
const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format });

const pipeline = device.createRenderPipeline({
  layout: "auto",
  vertex: {
    module: device.createShaderModule({ code: vertShaderCode }),
    entryPoint: "main",
  },
  fragment: {
    module: device.createShaderModule({ code: fragShaderCode }),
    entryPoint: "main",
    targets: [{ format }],
  },
});

// create a buffer for the uniform values
const uniformBufferSize =
  4     // 
  + 4   //
  + 4   //
  + 4;  //

// const uniformBuffer = device.createBuffer({
//   label: 'Rect description',
//   size: uniformBufferSize,
//   usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
// });

// // create a typedarray to hold the values for the uniforms in JavaScript
// const uniformValues = new Float32Array(uniformBufferSize / 4);

// // offsets to the various uniform values in float32 indices
// uniformValues.set(0.1);     // set centerX
// uniformValues.set(0.2, 1);  // set centerY
// uniformValues.set(0.2, 2);  // set width
// uniformValues.set(0.1, 3);  // set height

// const bindGroup = device.createBindGroup({
//   label: 'triangle bind group',
//   layout: pipeline.getBindGroupLayout(0),
//   entries: [
//     { binding: 0, resource: { buffer: uniformBuffer } },
//   ],
// });

const commandEncoder = device.createCommandEncoder();
const colorAttachments = [
  {
    view: context.getCurrentTexture().createView(),
    loadOp: "clear",
    storeOp: "store",
  },
];

// Set the uniform values in our JavaScript side Float32Array
const aspect = canvas.width / canvas.height;

// copy the values from JavaScript to the GPU
// device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

const passEncoder = commandEncoder.beginRenderPass({ colorAttachments });
passEncoder.setPipeline(pipeline);
// pass.setBindGroup(0, bindGroup);
passEncoder.draw(6);
passEncoder.end();

device.queue.submit([commandEncoder.finish()]);

// function fail(msg) {
//   alert(msg);
// }

// const observer = new ResizeObserver(entries => {
//   for (const entry of entries) {
//     const canvas = entry.target;
//     const width = entry.contentBoxSize[0].inlineSize;
//     const height = entry.contentBoxSize[0].blockSize;
//     canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
//     canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
//     // re-render
//     render();
//   }
// });
// observer.observe(canvas);