use std::f64::consts::PI;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
impl Point {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Point {
        Point { x, y }
    }
}

struct OpposedLine {
    length: f64,
    angle: f64,
}

fn find_opposed_line(a: Point, b: Point) -> OpposedLine {
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    OpposedLine {
        length: (dx * dx + dy * dy).sqrt(),
        angle: dy.atan2(dx),
    }
}

fn find_control_point(
    current: Point,
    previous: Option<Point>,
    next: Option<Point>,
    reverse: bool,
    smoothing: f64,
) -> Point {
    let p = previous.unwrap_or(current);
    let n = next.unwrap_or(current);
    let opposed = find_opposed_line(p, n);
    let angle = if reverse {
        opposed.angle + PI
    } else {
        opposed.angle
    };
    let length = opposed.length * smoothing;
    Point {
        x: current.x + angle.cos() * length,
        y: current.y + angle.sin() * length,
    }
}

fn round2(val: f64) -> f64 {
    (val * 100.0).round() / 100.0
}

fn generate_bezier(points: &[Point], i: usize, smoothing: f64) -> String {
    let cps = find_control_point(
        points[i - 1],
        if i >= 2 { Some(points[i - 2]) } else { None },
        Some(points[i]),
        false,
        smoothing,
    );
    let cpe = find_control_point(
        points[i],
        Some(points[i - 1]),
        points.get(i + 1).copied(),
        true,
        smoothing,
    );
    let p = points[i];
    format!(
        "C {:.2},{:.2} {:.2},{:.2} {:.2},{:.2}",
        round2(cps.x),
        round2(cps.y),
        round2(cpe.x),
        round2(cpe.y),
        round2(p.x),
        round2(p.y)
    )
}

#[wasm_bindgen]
pub fn points_to_path(points: Vec<Point>, smoothing: f64) -> String {
    if points.is_empty() {
        return "".to_string();
    }

    let mut d = format!("M {},{}", points[0].x, points[0].y);

    for i in 1..points.len() {
        d.push(' ');
        d.push_str(&generate_bezier(&points, i, smoothing));
    }

    d
}
