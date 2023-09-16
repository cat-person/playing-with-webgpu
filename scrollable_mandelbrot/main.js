import { getShaderSource } from '../common/shader_loader.js';
const vertShaderCode = await getShaderSource('./shaders/vert.wgsl');
const fragShaderCode = await getShaderSource('./shaders/frag.wgsl');

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

  let scrollLevel = 1.0;
  let centerX = 0.0;
  let centerY = 0.0;
  
  context.configure({
    device,
    format: presentationFormat,
  });

  const pipeline = device.createRenderPipeline({
    label: 'triangle with uniforms',
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({code: vertShaderCode}),
      entryPoint: "main",
    },
    fragment: {
      module: device.createShaderModule({code: fragShaderCode}),
      entryPoint: "main",
      targets: [{ format: presentationFormat }],
    },
  });

  const renderPassDescriptor = {
    label: 'our basic canvas renderPass',
    colorAttachments: [
      {
        // view: <- to be filled out when we render
        clearValue: [0.4, 0.2, 0.35, 1],
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  };

  render(0.9, adapter, device, canvas, context, pipeline, renderPassDescriptor);

  canvas.onmousemove = function(event){ 
    const rect = canvas.getBoundingClientRect();
    let x = (event.x - rect.left - 400) / 400;
    let y = (event.y - rect.top - 300) / 300;
    document.getElementById("currentCoordinates").textContent = `Current coordinates [ ${x} : ${y} ]`;
  };

  document.onwheel = function(event){ 
    const rect = canvas.getBoundingClientRect()
    let x = (event.x - rect.left - 400) / 400;
    let y = (event.y - rect.top - 300) / 300;
  
    let scrollDelta = event.wheelDeltaY / 10000;
    scrollLevel = scrollLevel + scrollDelta;
    let scrollExp = Math.pow(2, scrollLevel);
    let scrollDiff = Math.pow(2, scrollDelta);
  
    centerX += x * (1 - scrollDiff);
    centerY += y * (1 - scrollDiff);
  
    document.getElementById("scrollLevel").textContent = `Scroll level: ${scrollExp}`;
  
    document.getElementById("centerCoordinates").textContent = `Center coordinates [ ${centerX} : ${centerY} ]`;
    
    document.getElementById("borderCoordinates").textContent = `canvasView.x: ${rect.top}, canvasView.y : ${rect.left}`;

    render(Math.pow(2, scrollLevel), adapter, device, canvas, context, pipeline, renderPassDescriptor);
  };
}

function  render(scaleLevel, adapter, device, canvas, context, pipeline, renderPassDescriptor) {

  console.log(`scaleLevel = ${scaleLevel}`)

  const uniformBufferSize = 16; // offset is 2 32bit floats (4bytes each)
  const uniformBuffer = device.createBuffer({
    label: 'uniforms scroll params',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // create a typedarray to hold the values for the uniforms in JavaScript
  const uniformValues = new Float32Array(uniformBufferSize / 4);

  uniformValues.set([0.0, 0.0], 0);        // set the coordinates
  uniformValues.set([scaleLevel], 2);             // set the scale

  // Set the uniform values in our JavaScript side Float32Array
  // const aspect = canvas.width / canvas.height;
  uniformValues.set(1.0, 2); // set the scale

  // copy the values from JavaScript to the GPU
  device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

  const bindGroup = device.createBindGroup({
    label: 'triangle bind group',
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer }},
    ],
  });

  // Get the current texture from the canvas context and
  // set it as the texture to render to.
  renderPassDescriptor.colorAttachments[0].view =
      context.getCurrentTexture().createView();

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass(renderPassDescriptor);
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(6);  // call our vertex shader 3 times
  pass.end();

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}

main();

// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\\

