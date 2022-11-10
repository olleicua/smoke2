// copyright antha.earth

// documentation can be found here: http://antha.earth/smoke.html

// legal stuff:
// permission is hereby granted, free of charge, to any person obtaining a copy of this code and associated documentation (the software)
// to deal in the software without restriction including without limitation the rights to use, copy, modify, merge, publish, or distribute copies of the software,
// and to permit persons to whom the Software is furnished to do so
// the software is provided "as is", without warranty

class Smoke {
  constructor(options) {
    // defaults
    options ||= {};
    options.parent ||= document.body;
    options.spriteCount ||= 16;
    options.foreground ||= [144, 144, 144, 1];
    options.foreground[3] ||= 1;
    options.midground ||= options.foreground.slice(0, 3).concat([0.6]);
    options.midground[3] ||= 0.6;
    options.background ||= options.foreground.slice(0, 3).concat([0]);
    options.background[3] ||= 0;
    options.spriteRadious ||= 50;
    options.x ||= options.parent.clientWidth / 2;
    options.y ||= options.parent.clientHeight / 2;
    options.opacity ||= 1;
    options.animationMiliseconds ||= 200;

    options.deltaRadious ||= (smoke) => {
      return - smoke.options.spriteRadious / smoke.options.spriteCount;
    };

    options.deltaY ||= (smoke, sprite) => {
      return (sprite.y - smoke.y > 5) ? -10 : smoke.random(-25, 10);
    };

    options.deltaX ||= (smoke, sprite) => {
      return smoke.random(-20, 15);
    };

    options.deltaOpacity ||= (smoke) => {
      return - 1 / smoke.options.spriteCount;
    };

    // construct smoke
    this.options = options;
    this.currentOffset = 0;
    this.sprites = Array(this.options.spriteCount);

    // start animation
    this.animate();
  }

  // helper methods to call delta functions for a given sprite
  deltaRadious(sprite) {
    return this.options.deltaRadious(this, sprite);
  }

  deltaY(sprite) {
    return this.options.deltaY(this, sprite);
  }

  deltaX(sprite) {
    return this.options.deltaX(this, sprite);
  }

  deltaOpacity(sprite) {
    return this.options.deltaOpacity(this, sprite);
  }

  // helper function gives a random float within a range
  random(min, max) {
    return (Math.random() * (max - min)) + min;
  }

  // this.currentOffset represents an index into the sprite array
  // sprites before that point have already been created and started to
  // trail of into the distance
  // the current sprite must be reset to the initial state
  animate() {
    // create or reset current sprite
    this.sprites[this.currentOffset] ||= new SmokeSprite(this);
    this.sprites[this.currentOffset].reset(this);

    // loop over sprites that have been created
    for (let i = 0; i < this.options.spriteCount; i++) {
      let sprite = this.sprites[i];
      if (sprite) {

        // adjust the sprites that are not the current in based on deltas
        if (i !== this.currentOffset) {
          sprite.x += this.deltaX(sprite);
          sprite.y += this.deltaY(sprite);
          sprite.radius += this.deltaRadious(sprite);
          sprite.opacity += this.deltaOpacity(sprite);
        }
        
        // adjust z-indices so that sprites are stacked
        // in the order in which they were most recently reset
        if (i <= this.currentOffset) {
          sprite.zIndex = 10 + i + this.options.spriteCount;
        } else {
          sprite.zIndex = 10 + i;
        }
        
        // draw sprites into the document
        sprite.draw(this);
      }
    }
    
    // increment the offset
    this.currentOffset++;
    if (this.currentOffset >= this.options.spriteCount) this.currentOffset = 0;
    let that = this;
    
    // call animate again after a delay
    setTimeout(() => {
      that.animate();
    }, this.options.animationMiliseconds);
  }
}

class SmokeSprite {
  constructor(smoke) {
    this.x = 0;
    this.y = 0;
    this.radius = 0;
    this.opacity = 0;
    this.el = document.createElement('div');
    this.el.style.display = 'none';
    this.el.style.position = 'absolute';
    smoke.options.parent.append(this.el);
  }

  reset(smoke) {
    this.x = smoke.options.x;
    this.y = smoke.options.y;
    this.radius = smoke.options.spriteRadious;
    this.opacity = smoke.options.opacity;
  }

  draw(smoke) {
    this.el.style.top = (this.y - (this.radius / 2)) + 'px';
    this.el.style.left = (this.x - (this.radius / 2)) + 'px';
    this.el.style.zIndex = this.zIndex;
    this.el.style.width = (2 * this.radius) + 'px';
    this.el.style.height = (2 * this.radius) + 'px';
    let fg = smoke.options.foreground.slice();
    let mg = smoke.options.midground.slice();
    let bg = smoke.options.background.slice();
    fg[3] *= this.opacity;
    mg[3] *= this.opacity;
    bg[3] *= this.opacity;
    this.el.style.background = 'radial-gradient(' +
      'closest-side,' +
      `rgba(${fg.join(',')}),` +
      `rgba(${mg.join(',')}),` +
      `rgba(${bg.join(',')}))`;
    this.el.style.display = 'block';
  }
};
