import { buildInterpretationRequest } from './ai.mjs';
import { distanceSchema,validateDistanceInterpretation } from '../shared/distance-contract.js';
export function buildDistanceRequest(description,model) {
 const request=buildInterpretationRequest(description,model);
 const old='x is stereo left (-1) to right (1); distance from centre is prominence. x*x+y*y must be <=1. y is a visual coordinate, not behind/in front, outdoors, or through a wall.';
 if(!request.instructions.includes(old))throw new Error('Baseline prompt changed');
 request.instructions=request.instructions.replace(old,'Return semantic distance near, mid, or far and side left, centre, or right instead of coordinates. near means close/foreground/prominent (radius 0.20); mid means moderate presence (radius 0.55); far means distant/far away/background/receded (radius 0.85). Honour explicit distance and side language; when unspecified, choose a restrained interpretation. Ordinary code computes coordinates. Describe prominence consistently with your category; far is quieter for the same source, not through a wall or outdoors. Side is stereo direction, never front/behind.');
 request.text.format.schema=distanceSchema;
 return request;
}
export function parseDistanceResponse(response,description) {
 if(response?.status!=='completed'||!Array.isArray(response.output))throw new Error('Interpretation unavailable');
 const content=response.output.filter(x=>x.type==='message').flatMap(x=>x.content??[]);
 if(content.some(x=>x.type==='refusal'))throw new Error('Interpretation unavailable');
 return validateDistanceInterpretation(JSON.parse(content.filter(x=>x.type==='output_text').map(x=>x.text).join('')),description);
}
