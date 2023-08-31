import { getShaderSource } from '../common/shader_loader.js';

const vertShaderCode = await getShaderSource('./shaders/vert.wgsl');
const fragShaderCode = await getShaderSource('./shaders/frag.wgsl');

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu");
const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format });

let x = 0;
let y = 0;
let scrollLevel = 1;

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
passEncoder.draw(6);
passEncoder.end();
device.queue.submit([commandEncoder.finish()]);

document.getElementById("canvas").onmousemove = function(event){ 
  let x = Math.pow(2, scrollLevel) * (event.x - 400) / 800;
  let y = Math.pow(2, scrollLevel) * (event.x - 300) / 600;
  document.getElementById("currentCoordinates").textContent = `Current coordinates [ ${x} : ${y} ]`;
};

document.onwheel = function(event){ 
  scrollLevel = scrollLevel + event.wheelDeltaY / 10000;
  console.log(Math.pow(2, scrollLevel));

  document.getElementById("scrollLevel").textContent = `Scroll level: ${Math.pow(2, scrollLevel)}`
  document.getElementById("centerCoordinates").textContent = `Center coordinates [ ${0} : ${0} ]`;
};
//     let img_top = title.offsetTop;
//     let img_left = title.offsetLeft;

//     let wide = window.innerWidth;
//     let length = window.innerHeight;

//     // if((img_top <= length/2) && (img_left <= wide/2))
//     // {
//     console.log({event});
//       // title.style.top = img_top + length/3 + "px";
//       // title.style.left = img_left + wide/4 + "px";
//     // }
//     // else if((img_top <= length/2) && (img_left >= wide/2))
//     // {
//     //   console.log("bunny");
//     //   // title.style.top = img_top + length/3 + "px";
//     //   // title.style.left = img_left + wide/2 - "px";
//     // }
//     // else if((img_top >= length/2) && (img_left <= wide/2))
//     // {
//     //   console.log("bunny");
//     //   // title.style.top = img_top - length/3 + "px";
//     //   // title.style.left = img_left + wide/3 + "px";
//     // }
//     // else if((img_top >= length/2) && (img_left >= wide/2))
//     // {
//     //   console.log("bunny");
//     //   // title.style.top = img_top - length/4 + "px";
//     //   // title.style.left = img_left - wide/8 + "px";
//     // }

// });