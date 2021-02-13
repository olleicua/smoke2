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
    options.spriteRadious ||= 100;
    options.x ||= options.parent.clientWidth / 2;
    options.y ||= options.parent.clientHeight / 2;
    options.opacity ||= 1;
    options.animationMiliseconds = 200;

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

  random(min, max) {
    return (Math.random() * (max - min)) + min;
  }

  animate() {
    this.sprites[this.currentOffset] ||= new Sprite(this);
    this.sprites[this.currentOffset].reset(this);
    for (let i = 0; i < this.options.spriteCount; i++) {
      let sprite = this.sprites[i];
      if (sprite) {
        if (i !== this.currentOffset) {
          sprite.x += this.deltaX(sprite);
          sprite.y += this.deltaY(sprite);
          sprite.radius += this.deltaRadious(sprite);
          sprite.opacity += this.deltaOpacity(sprite);
        }
        this.sprites[i].draw(this);
      }
    }
    this.currentOffset++;
    if (this.currentOffset >= this.options.spriteCount) this.currentOffset = 0;
    let that = this;
    setTimeout(() => {
      that.animate();
    }, this.options.animationMiliseconds);
  }
}

class Sprite {
  constructor(smoke) {
    this.x = 0;
    this.y = 0;
    this.radius = 0;
    this.el = document.createElement('div');
    this.el.style.display = 'none';
    this.el.style.position = 'absolute';
    this.el.style.background = 'radial-gradient(' +
      'closest-side,' +
      `rgba(${smoke.options.foreground.join(',')}),` +
      `rgba(${smoke.options.midground.join(',')}),` +
      `rgba(${smoke.options.background.join(',')}))`;
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
    this.el.style.width = this.radius + 'px';
    this.el.style.height = this.radius + 'px';
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
