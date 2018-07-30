precision highp float;
//precision lowp int;
//uniform vec2 iResolution;
uniform float iTime;

varying vec2 vUv;


  float Hash( vec2 p)
  {
       vec3 p2 = vec3(p.xy,1.0);
      return fract(sin(dot(p2,vec3(37.1,61.7, 12.4)))*3758.5453123);
  }
  
  float noise(in vec2 p)
  {
      vec2 i = floor(p);
       vec2 f = fract(p);
       f *= f * (1.5-.5*f);
  
      return mix(mix(Hash(i + vec2(0.,0.)), Hash(i + vec2(1.,0.)),f.x),
                 mix(Hash(i + vec2(0.,1.)), Hash(i + vec2(1.,1.)),f.x),
                 f.y);
  }
  
  float fbm(vec2 p)
  {
       float v = 0.0;
       v += noise(p*1.0)*.5;
       v += noise(p*2.)*.25;
       v += noise(p*4.)*.125;
       //v += noise(p*8.)*.0625;
  	  // v += noise(p*8.)*.03125;
  	  // v += noise(p*8.)*.015655;
  	
       return v * 1.0;
  }
  
  void main( void ) 
  {
  
  	vec2 uv = vUv * 2.0 - 1.0;
  	//uv.x *= uv.x/uv.y;
  	
  		
  	vec3 finalColor = vec3( 0.0 );
  	for( int i=1; i < 3; ++i )
  	{
  		float hh = float(i) * 0.1;
  		float t = abs(.750 / ((uv.x + fbm( uv + (iTime*5.75)/float(i)))*65.));
  		finalColor +=  t * vec3( hh+0.1, hh+0.5, 2.0 );
  	}
  	
  //	finalColor += 1.0 - smoothstep(0.0, 0.01, abs(uv.x + 0.3 * (fbm(uv * 3.0 + iTime * 5.0)) - 0.5));
  	
  	gl_FragColor = vec4( finalColor, 1.0 );
  
  }