type FeedbackLoop struct {
    ID        string
    State     float64
    Neighbors []*FeedbackLoop
    History   []float64
}

func (f *FeedbackLoop) Step() {
    // Observe own state and neighbors
    self := f.State
    neighborSum := 0.0
    for _, n := range f.Neighbors {
        neighborSum += n.State
    }
    // Simple curiosity: perturb state based on difference with neighbors
    delta := (neighborSum/float64(len(f.Neighbors)) - self) * 0.1
    f.State += delta + (rand.Float64()-0.5)*0.01 // add a little noise
    f.History = append(f.History, f.State)
    // Optionally, evolve: change how delta is computed over time
}

{
  "vertices": [
    {"id": "flup-plus", "x": 1, "y": 1, "z": 0},
    {"id": "flup-minus", "x": -1, "y": 1, "z": 0},
    {"id": "cflup-n", "x": 0, "y": -1, "z": 1}
  ],
  "edges": [
    ["flup-plus", "flup-minus"],
    ["flup-minus", "cflup-n"],
    ["cflup-n", "flup-plus"]
  ]
}