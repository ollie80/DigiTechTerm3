import * as ex from "excalibur";

export class Tween {
  private elapsed: number = 0;
  private duration: number;
  private from: number;
  private to: number;
  private ease: (t: number) => number;
  private onUpdate: (value: number) => void;
  private onComplete: () => void;

  constructor(
    duration: number,
    from: number,
    to: number,
    ease: (t: number) => number,
    onUpdate: (value: number) => void,
    onComplete: () => void
  ) {
    this.duration = duration;
    this.from = from;
    this.to = to;
    this.ease = ease;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  update(delta: number): boolean {
    this.elapsed += delta;

    const t = Math.min(this.elapsed / this.duration, 1);
    const value = this.from + (this.to - this.from) * this.ease(t);
    this.onUpdate(value);

    if (t === 1) {
      this.onComplete();
      return true;
    }

    return false;
  }
}

export const Ease = {
  linear: (t: number) => t,
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  // Add more easing functions as needed
};

export class TweenableActor extends ex.Actor {
  public tweens: Tween[] = [];

  addTween(tween: Tween) {
    this.tweens.push(tween);
  }

  onPostUpdate(engine: ex.Engine, delta: number) {
    this.tweens = this.tweens.filter((tween) => !tween.update(delta));
  }

  tweenPosition(
    targetX: number,
    targetY: number,
    duration: number,
    ease: (t: number) => number = Ease.linear
  ) {
    const startX = this.pos.x;
    const startY = this.pos.y;

    const tweenX = new Tween(
      duration,
      startX,
      targetX,
      ease,
      (value) => {
        this.pos.x = value;
      },
      () => {
        console.log("Position X Tween Complete");
      }
    );

    const tweenY = new Tween(
      duration,
      startY,
      targetY,
      ease,
      (value) => {
        this.pos.y = value;
      },
      () => {
        console.log("Position Y Tween Complete");
      }
    );

    this.addTween(tweenX);
    this.addTween(tweenY);
  }

  tweenRotation(
    targetRotation: number,
    duration: number,
    ease: (t: number) => number = Ease.linear
  ) {
    const startRotation = this.rotation;

    const tween = new Tween(
      duration,
      startRotation,
      targetRotation,
      ease,
      (value) => {
        this.rotation = value;
      },
      () => {
        console.log("Rotation Tween Complete");
      }
    );

    this.addTween(tween);
  }

  // Additional tween methods can be added here, like for scale, opacity, etc.
}
