precision mediump float;
//precision lowp int;
//uniform vec2 iResolution;
uniform float iTime;
uniform sampler2D iTextureFlame;
uniform sampler2D iTextureAlpha;
uniform sampler2D iTextureBack;
uniform float iFlameDensity;
uniform float iFlameBrightness;
uniform float iFlameForm1;
uniform float iFlameForm2;
uniform float iFlameRays1;
uniform float iFlameRays2;
uniform float iFlameOutbreak;
uniform float iRed;
uniform float iGreen;
uniform float iBlue;
uniform float iMix;
uniform float iRedOutbreak;
uniform float iGreenOutbreak;
uniform float iBlueOutbreak;
varying vec2 vUv;


    void main()
    {
      vec2 uv = vUv;
      uv = uv * 2. -1.;
      //uv.y = vUv.y;


      vec4 rndUp = texture2D(iTextureFlame, vec2(0.01 * uv.x + iTime * 1.6, 0.03 * uv.y + iTime * 0.8)); // (0.01 * uv) - детализация молнии (iTime * 0.1) - скорость вибрации //верх
      vec4 rndDown = texture2D(iTextureFlame, vec2(0.01 * uv.x + iTime * 1.6, 0.03 * uv.y + iTime * 0.5)); // (0.01 * uv) - детализация молнии (iTime * 0.5) - скорость вибрации //низ

     float intensity2 = mix(rndDown.y *3.7, rndUp.x *3.7, clamp(rndDown.y, rndUp.x, uv.y));//шум ветвей
     float intensity = mix(rndDown.y*5.5, rndUp.y*5.5, uv.y); //шум столба

      float ty = clamp((uv.x *-uv.y * 0.09) + 0.1, 0., 0.1); // (uv.y * -uv.y) - фиксация хвостов молнии; (* 0.09) длина фиксированных хвостов; (+ 0.1) ширина столба
      float tx = clamp((uv.x * -uv.x * 0.09) + 0.1, 0., 1.);
         vec2 n0UvB = vUv;
         intensity = intensity * texture2D(iTextureBack, n0UvB*cos(iTime*5.)*0.35).x;
         intensity2 = intensity2 * texture2D(iTextureAlpha, n0UvB*cos(iTime*5.)*0.12).x;


      float x = abs(intensity2 * tx * (sin(iTime*10000.)*15.2 - cos(iTime*10000.)*15.5) + uv.y*3. + sin(iTime*10000.)*2.5);

      //float y = abs(intensity * ty * (sin(iTime*5.)*3.2 - cos(iTime*5.)*3.5) + uv.x*4.+ sin(iTime*1.)*0.1);
      float y = abs(intensity * ty * (clamp(sin(iTime*35.)*10.5, 1.5,6.5) - clamp(cos(iTime*35.)*10.5, 3.5,5.5)) + uv.x*clamp(sin(iTime), 3.0,4.0));
      float k = min(x, y);
      float g = pow(k, clamp(sin(iTime*12.0)*0.25, 0.0, 0.55));
      float f = pow(y, clamp(sin(iTime*55.0)*0.11, 0.09, 0.22));


      vec3 col = vec3(1.4, 1.4, 1.8);

      vec3 col1 = col * -f + col + 0.08;

           col = col * -g + col;

      //col = col * col;
        float alpha = col.x * col1.x - 0.03;
        //alpha = alpha * alpha;
      col1 = col1 * 1.5;

      //alpha = alpha * alpha;
      //gl_FragColor.rgb = col;
      gl_FragColor.rgb = col * col1 + col1 * 0.7 ;


     // gl_FragColor.w = col.x * col1.x;
      gl_FragColor.w = clamp(sin(alpha), 0.0, 1.0);
    }