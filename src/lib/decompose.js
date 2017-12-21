// https://gist.github.com/Breton/9d217e0375de055d563b9a0b758d4ae6
const decomposeMatrix = (m) => {
	var t,r,s,k,E,F,G,H,Q,R,sx,sy,a1,a2,theta,phi,sqrt=Math.sqrt,atan2=Math.atan2;
	// http://math.stackexchange.com/questions/861674/decompose-a-2d-arbitrary-transform-into-only-scaling-and-rotation
	// 
	// It works wonderfully! Thanks. 
	// The input matrix is transposed though, 
	// so let me spell the solution out. 
	

	E=(m[0]+m[3])/2
	F=(m[0]-m[3])/2
	G=(m[2]+m[1])/2
	H=(m[2]-m[1])/2

	Q=sqrt(E*E+H*H);
	R=sqrt(F*F+G*G);
	sx=Q+R; 
	sy=Q-R; 
	a1=atan2(G,F); 
	a2=atan2(H,E); 
	theta=(a2-a1)/2; 
	phi=(a2+a1)/2;

	// The requested parameters are then theta, 
	// sx, sy, phi,
	//  i.e. rotate by theta, 
	k=-theta*180/Math.PI;
	//  scale by sx,sy, 
	s=[sx,sy];
	//  rotate by phi. 
	r=-phi*180/Math.PI;
	//No division by zero or sqrt(negative) hazard. Excellent. 
	t=[m[4],m[5]];
	return {translate:t,rotate:r,scale:s,skew:k};
}

//'matrix(0.68234576,0,0,0.67954153,-43.222189,95.273279)' → [0.68234576,0,0,0.67954153,-43.222189,95.273279]
const parseMatrix = (m) => {
  return m.slice('matrix('.length, -1).split(',').map(parseFloat)
}

const parseTranslate = (m) => {
  return m.slice('translate('.length, -1).split(',').map(parseFloat)
}

//fairly sure inkscape doesn't use compound transforms, e.g. translate(x,y)scale(a,b)
const decomposeTransformAttribute = (transform) => {
  if (transform.startsWith('matrix')) {
    return decomposeMatrix(parseMatrix(transform))
  } else if (transform.startsWith('translate')) {
    return {
      translate: parseTranslate(transform),
      rotate: 0,
      scale: [1, 1],
      skew: 0
    }
  } else {
    console.error('yikes, not sure about this one: ', transform)
    return {
      translate: [0, 0],
      rotate: 0,
      scale: [1, 1],
      skew: 0
    }
  }
}

exports.decomposeTransformAttribute = decomposeTransformAttribute
