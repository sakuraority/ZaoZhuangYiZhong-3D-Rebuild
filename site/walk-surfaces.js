// Feet height distinguishes walking on an elevated deck from passing beneath it.
export function walkSurface(x,z,feet,stairs){
 let y=.15;
 for(const s of stairs){if(Math.abs(x-s.x)<=s.w/2&&Math.abs(z-s.z)<=s.length/2&&(s.base<.5||feet>=s.base-.5))y=Math.max(y,s.base+s.height*Math.max(0,Math.min(1,.5-(z-s.z)*s.dir/s.length)));}
 if(Math.abs(x-117)<11&&z>=124&&z<=131.5)y=Math.max(y,4);
 const decks=[[197.6,200,69.5,217.5,4.04],[142.3,146.5,148.5,217.5,3.65],[152.3,156.5,69.5,134.5,3.65],[142.3,186.7,134.5,148.5,3.65],[182,185,134.75,139.25,8.2]];
 for(const [x0,x1,z0,z1,h] of decks)if(x>=x0&&x<=x1&&z>=z0&&z<=z1&&feet>=h-.5)y=Math.max(y,h);
 // Existing solid stair flight connecting the terrace to the upper landing.
 if(x>=160&&x<=182&&z>=134.75&&z<=139.25&&feet>=3.15)y=Math.max(y,3.65+4.55*(x-160)/22);
 // Both spectator stands: each visible tread has a matching solid walk surface.
 for(const [cz,d] of [[102,65],[183,69]])if(Math.abs(z-cz)<=d/2){for(let i=0;i<9;i++)if(Math.abs(x-(204-i*.7))<=.38)y=Math.max(y,.36+i*.46);}
 return y;
}
