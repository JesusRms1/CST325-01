/*
 * An "object" representing a 3d vector to make operations simple and concise.
 *
 * Similar to how we work with plain numbers, we will work with vectors as
 * an entity unto itself.  Note the syntax below: var Vector3 = function...
 * This is different than you might be used to in most programming languages.
 * Here, the function is meant to be instantiated rather than called and the
 * instantiation process IS similar to other object oriented languages => new Vector3()
 */

var Vector3 = function(x = 0, y = 0, z = 0) {
  this.x = x; this.y = y; this.z = z;

  // Sanity check to prevent accidentally using this as a normal function call
  if (!(this instanceof Vector3)) {
    console.error("Vector3 constructor must be called with the 'new' operator");
  }

  // DONE - make sure to set a default value in case x, y, or z is not passed in
}

Vector3.prototype = {

  //----------------------------------------------------------------------------- 
  set: function(x, y, z) {
    // DONE - set 'this' object's values to those from x, y, and z
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  },

  //----------------------------------------------------------------------------- 
  clone: function() {
    return new Vector3(this.x, this.y, this.z);
  },

  //----------------------------------------------------------------------------- 
  copy: function(other) {
    // copy the values from other into 'this'
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;

    return this;
  },

  //----------------------------------------------------------------------------- 
  negate: function() {
    // multiply 'this' vector by -1
    // This SHOULD change the values of this.x, this.y, and this.z
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;

    return this;
  },

  //----------------------------------------------------------------------------- 
  add: function(v) {
    // DONE - add v to 'this' vector
    // This SHOULD change the values of this.x, this.y, and this.z
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
  },

  //----------------------------------------------------------------------------- 
  subtract: function(v) {
    // DONE - subtract v from 'this' vector
    // This SHOULD change the values of this.x, this.y, and this.z
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
  },

  //----------------------------------------------------------------------------- 
  multiplyScalar: function(scalar) {
    // multiply 'this' vector by "scalar"
    // This SHOULD change the values of this.x, this.y, and this.z
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;

    return this;
  },

  //----------------------------------------------------------------------------- 
  length: function() {
    // todo - return the magnitude (A.K.A. length) of 'this' vector
    // This should NOT change the values of this.x, this.y, and this.z
    var length;
    length = Math.pow(this.x,2) + Math.pow(this.y,2) + Math.pow(this.z,2);
    length = Math.sqrt(length);
    return length;
  },

  //----------------------------------------------------------------------------- 
  lengthSqr: function() {
    // todo - return the squared magnitude of this vector ||v||^2
    // This should NOT change the values of this.x, this.y, and this.z

    // There are many occasions where knowing the exact length is unnecessary 
    // and the square can be substituted instead (for performance reasons).  
    // This function should NOT have to take the square root of anything.
    var lengthSquared = this.length();
    lengthSquared = Math.pow(lengthSquared, 2);

    return lengthSquared;
  },

  //----------------------------------------------------------------------------- 
  normalize: function() {
    // todo - Change the components of this vector so that its magnitude will equal 1.
    // This SHOULD change the values of this.x, this.y, and this.z
    var length = this.length();
    this.x = this.x / length;
    this.y = this.y / length;
    this.z = this.z / length;
    return this;
  },

  //----------------------------------------------------------------------------- 
  dot: function(other) {
    // todo - return the dot product betweent this vector and "other"
    // This should NOT change the values of this.x, this.y, and this.z
    var dot2 = this.x * other.x + this.y * other.y + this.z * other.z;

    return dot2;
  },


  //============================================================================= 
  // The functions below must be completed in order to receive an "A"
  //----------------------------------------------------------------------------- 
  fromTo: function(fromPoint, toPoint) {
    if (!(fromPoint instanceof Vector3) || !(toPoint instanceof Vector3)) {
      console.error("fromTo requires to vectors: 'from' and 'to'");
    }
    // todo - return the vector that goes from "fromPoint" to "toPoint"
    //        NOTE - "fromPoint" and "toPoint" should not be altered
    var newX = toPoint.x - fromPoint.x;
    var newY = toPoint.y - fromPoint.y;
    var newZ = toPoint.z - fromPoint.z;
    
    var fromTo = new Vector3(newX, newY, newZ);

    return fromTo;
  },

  //----------------------------------------------------------------------------- 
  rescale: function(newScale) {
    // todo - Change this vector's length to be newScale
    var newlength =  newScale / this.length();
    this.x *= newlength;
    this.y *= newlength;
    this.z *= newlength;
    return this;
  },

  //----------------------------------------------------------------------------- 
  angle: function(v1, v2) {
    // todo - calculate the angle in degrees between vectors v1 and v2. Do NOT
    //        change any values on the vectors themselves
    var angle = v1.dot(v2);
    angle = angle / (v1.length() * v2.length());

    // result is in radians
    angle = Math.acos(angle);

    return angle * (180/Math.PI);
  },

  //----------------------------------------------------------------------------- 
  project: function(vectorToProject, otherVector) {
    // todo - return a vector that points in the same direction as "otherVector"
    //        but whose length is the projection of "vectorToProject" onto "otherVector"
    //        NOTE - "vectorToProject" and "otherVector" should NOT be altered (i.e. use clone)
    //        See "Vector Projection Slides" under "Extras" for more info.
    var projectionVector = otherVector.clone();
    var newLength = vectorToProject.dot(otherVector) / otherVector.length();
    projectionVector.rescale(newLength);

    return projectionVector;
  }
};

 
