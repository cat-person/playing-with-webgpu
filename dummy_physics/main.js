// import { getShaderSource } from '../common/shader_loader.js';

// const vertShaderCode = await getShaderSource('./shaders/vert.wgsl');
// const fragShaderCode = await getShaderSource('./shaders/frag.wgsl');

// const adapter = await navigator.gpu.requestAdapter();
// const device = await adapter.requestDevice();

// const context = canvas.getContext("webgpu");
// const format = navigator.gpu.getPreferredCanvasFormat();
// context.configure({ device, format });

// const pipeline = device.createRenderPipeline({
//   layout: "auto",
//   vertex: {
//     module: device.createShaderModule({ code: vertShaderCode }),
//     entryPoint: "main",
//   },
//   fragment: {
//     module: device.createShaderModule({ code: fragShaderCode }),
//     entryPoint: "main",
//     targets: [{ format }],
//   },
// });
// const commandEncoder = device.createCommandEncoder();
// const colorAttachments = [
//   {
//     view: context.getCurrentTexture().createView(),
//     loadOp: "clear",
//     storeOp: "store",
//   },
// ];

// const uniformBufferSize =
//   4    // centerX: float
//   + 4  // centerY: float 
//   + 4  // width: float
//   + 4; // height: float

// const uniformBuffer = device.createBuffer({
//   size: uniformBufferSize,
//   usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
// });

// const uniformValues = new Float32Array(4);

// uniformValues.set(0.1, 0);
// uniformValues.set(0.2, 1);
// uniformValues.set(0.1, 2);
// uniformValues.set(0.3, 3);

// const bindGroup = device.createBindGroup({
//   layout: pipeline.getBindGroupLayout(0),
//   entries: [
//     { binding: 0, resource: { buffer: uniformBuffer }},
//   ],
// });

// const passEncoder = commandEncoder.beginRenderPass({ colorAttachments });
// passEncoder.setPipeline(pipeline);
// passEncoder.draw(6);
// passEncoder.end();
// device.queue.submit([commandEncoder.finish()]);

async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail('need a browser that supports WebGPU');
    return;
  }

  // Get a WebGPU context from the canvas and configure it
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('webgpu');
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
  });

  const module = device.createShaderModule({
    code: `
      struct OurStruct {
        color: vec4f,
        scale: vec2f,
        offset: vec2f,
      };

      @group(0) @binding(0) var<uniform> ourStruct: OurStruct;

      @vertex fn vs(
        @builtin(vertex_index) vertexIndex : u32
      ) -> @builtin(position) vec4f {
        let pos = array(
          vec2f( 0.0,  0.5),  // top center
          vec2f(-0.5, -0.5),  // bottom left
          vec2f( 0.5, -0.5)   // bottom right
        );

        return vec4f(
          pos[vertexIndex] * ourStruct.scale + ourStruct.offset, 0.0, 1.0);
      }

      @fragment fn fs() -> @location(0) vec4f {
        return ourStruct.color;
      }
    `,
  });

  const pipeline = device.createRenderPipeline({
    label: 'triangle with uniforms',
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vs',
    },
    fragment: {
      module,
      entryPoint: 'fs',
      targets: [{ format: presentationFormat }],
    },
  });

  // create a buffer for the uniform values
  const uniformBufferSize =
    4 * 4 + // color is 4 32bit floats (4bytes each)
    2 * 4 + // scale is 2 32bit floats (4bytes each)
    2 * 4;  // offset is 2 32bit floats (4bytes each)
  const uniformBuffer = device.createBuffer({
    label: 'uniforms for triangle',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // create a typedarray to hold the values for the uniforms in JavaScript
  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kColorOffset = 0;
  const kScaleOffset = 4;
  const kOffsetOffset = 6;

  uniformValues.set([0, 1, 0, 1], kColorOffset);        // set the color
  uniformValues.set([-0.5, -0.25], kOffsetOffset);      // set the offset

  const bindGroup = device.createBindGroup({
    label: 'triangle bind group',
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer }},
    ],
  });

  const renderPassDescriptor = {
    label: 'our basic canvas renderPass',
    colorAttachments: [
      {
        // view: <- to be filled out when we render
        clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  };

  function render() {
    // Set the uniform values in our JavaScript side Float32Array
    const aspect = canvas.width / canvas.height;
    uniformValues.set([0.5 / aspect, 0.5], kScaleOffset); // set the scale

    // copy the values from JavaScript to the GPU
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

    // Get the current texture from the canvas context and
    // set it as the texture to render to.
    renderPassDescriptor.colorAttachments[0].view =
        context.getCurrentTexture().createView();

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);  // call our vertex shader 3 times
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const canvas = entry.target;
      const width = entry.contentBoxSize[0].inlineSize;
      const height = entry.contentBoxSize[0].blockSize;
      canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
      canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
      // re-render
      render();
    }
  });
  observer.observe(canvas);
}

function fail(msg) {
  alert(msg);
}

main();