# fLups Formal Logic and Mathematical Proof

## 1. Definitions

- **System State:**
  $S(t) = \{s_1(t), s_2(t), ..., s_n(t)\}$
  where each $s_i(t)$ is the state of node $i$ at (virtual) time $t$.

- **Action:**
  An action $A$ is a rule-based transition:
  $S(t+1) = A(S(t))$
  If no action is possible, $S(t+1) = S(t)$.

- **Relational Time:**
  Time is defined only by the occurrence of actions.
  If no action occurs, time is undefined for the system in isolation.

- **2D Lattice Encoding:**
  There exists a mapping $f: \mathbb{R}^3 \to \mathbb{R}^2$ \
  such that all relevant relations and transitions in 3D are preserved in the 2D lattice.

---

## 2. Axioms

1. **Relational Time Axiom:**
   For a system $S$, time is only defined by the sequence of actions $\{A_k\}$.
   If $\forall k, A_k(S) = S$, then time is undefined for $S$ unless compared to another system $S'$ \
   where $A'_k(S') \neq S'$.

2. **Information Preservation Axiom:**
   The 2D lattice encoding $f$ is invertible for all system-relevant information:
   $\exists f^{-1}$ such that $f^{-1}(f(\vec{v})) = \vec{v}$ for all $\vec{v}$ in the system’s state space.

3. **Action-Driven Evolution Axiom:**
   The system evolves only through discrete actions; no action, no evolution.

---

## 3. Theorems and Proof Sketches

### Theorem 1: Relational Time Indeterminacy

**Statement:**
If a system $S$ has no actions, its time is undefined unless there exists another system $S'$ with which it can be compared.

**Proof Sketch:**

- By Axiom 1, time is only defined by actions.
- If no actions, time cannot be measured internally.
- Only by comparing to another system with actions can a temporal relation be established.

### Theorem 2: 2D Lattice Information Completeness

**Statement:**
The 2D lattice encoding preserves all system-relevant information from the 3D (or higher) state.

**Proof Sketch:**

- By Axiom 2, $f$ is invertible for all relevant vectors.
- All adjacency, action, and state information is encoded in the 2D lattice structure and action rules.
- Therefore, the system’s evolution and state can be reconstructed from the 2D lattice.

### Theorem 3: Action-Driven Temporal Discreteness

**Statement:**
The system’s time is discrete and advances only with actions.

**Proof Sketch:**

- By Axiom 3, each action increments time by one unit.
- If no action, time does not advance.

---

## 4. Formal Logic Notation Example

- Let $\mathcal{A}$ be the set of possible actions.
- Let $\mathcal{S}$ be the set of possible system states.
- $\forall t, S(t+1) = A(S(t)), A \in \mathcal{A}$ if $A$ is valid; else $S(t+1) = S(t)$.
- Time $t$ is only incremented if $S(t+1) \neq S(t)$.

---

## 5. Conclusion

- The fLups system’s time is fundamentally relational and discrete.
- The 2D lattice encoding is information-preserving and invertible for all system-relevant data.
- The system’s evolution is fully determined by the sequence of actions, and time is undefined in the absence of action unless compared to another system.

---

*This document is auto-generated. For updates, rerun the automation script or update the axioms/theorems as needed.*
