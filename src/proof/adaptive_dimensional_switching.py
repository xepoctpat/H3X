import numpy as np
import matplotlib.pyplot as plt
import logging
import unittest

# === Logging Setup ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# === DimensionalNode Class ===
class DimensionalNode:
    def __init__(self, id, workload, dimension=2, threshold=0.7, buffer_limit=3):
        """
        Each node adapts its dimensional state based on dynamic workload.
        
        Parameters:
        - id: Unique identifier.
        - workload: Initial workload intensity (0-1).
        - dimension: Initial dimension (typically 2 for minimal encoding).
        - threshold: Workload threshold to trigger increasing the transition buffer.
        - buffer_limit: Number of consecutive updates above the threshold required to transition.
        """
        self.id = id
        self.workload = workload
        self.dimension = dimension  # 2D or 4D state
        self.transition_buffer = 0  # Buffer for gradual switching
        self.threshold = threshold
        self.buffer_limit = buffer_limit

    def evaluate_workload(self):
        """Assess workload and determine whether to switch dimensions."""
        if self.workload > self.threshold:
            self.transition_buffer += 1
            logging.debug(f"Node {self.id}: Workload {self.workload:.2f} > {self.threshold}, buffer increased to {self.transition_buffer}.")
            if self.transition_buffer > self.buffer_limit:
                self.dimension = 4  # Switch to higher encoding
                logging.info(f"Node {self.id}: Buffer {self.transition_buffer} > {self.buffer_limit} — switching dimension to 4.")
        else:
            # Decrease the buffer gradually
            self.transition_buffer = max(0, self.transition_buffer - 1)
            logging.debug(f"Node {self.id}: Workload {self.workload:.2f} <= {self.threshold}, buffer decreased to {self.transition_buffer}.")
            if self.transition_buffer == 0:
                self.dimension = 2  # Reset to 2D when the condition is not sustained
                logging.info(f"Node {self.id}: Buffer reset — reverting dimension to 2.")

    def update(self):
        """Simulate a change in the node’s workload and update its state."""
        self.workload = np.random.uniform(0, 1)
        self.evaluate_workload()

# === Multi-node Simulation ===
def simulate_nodes(num_nodes=10, steps=50):
    """
    Simulate a network of nodes updating their states over time.
    
    Returns:
    A dictionary mapping node ids to their dimension history over time.
    """
    # Create nodes with a random starting workload.
    nodes = [DimensionalNode(id=i, workload=np.random.uniform(0, 1)) for i in range(num_nodes)]
    
    # Dictionary to hold dimension history of each node
    dimension_history = {i: [] for i in range(num_nodes)}
    
    for step in range(steps):
        logging.info(f"--- Step {step} ---")
        for node in nodes:
            node.update()
            dimension_history[node.id].append(node.dimension)
            logging.info(f"Node {node.id}: Workload={node.workload:.2f}, Dimension={node.dimension}")
    
    return dimension_history

# === Visualization ===
def visualize_simulation(dimension_history):
    """
    Visualize the dimensional state evolution over time for each node.
    """
    plt.figure(figsize=(10, 6))
    steps = len(next(iter(dimension_history.values())))
    
    for node_id, dims in dimension_history.items():
        plt.plot(range(steps), dims, label=f"Node {node_id}")
    
    plt.xlabel("Step")
    plt.ylabel("Dimension (2 or 4)")
    plt.title("Dimensional Evolution Over Time")
    plt.legend()
    plt.grid(True)
    plt.show()

# === Unit Tests ===
class TestDimensionalNode(unittest.TestCase):
    def test_transition_to_4d(self):
        """
        Test that a node with consistently high workload eventually transitions to 4D.
        """
        # Set up a node with a workload that is always above threshold.
        node = DimensionalNode(id=0, workload=1.0, threshold=0.7, buffer_limit=3)
        # Simulate enough updates so that the transition buffer should exceed the limit.
        for _ in range(5):
            node.update()
        self.assertEqual(node.dimension, 4, "Node should transition to 4D when workload remains high.")

    def test_reset_to_2d(self):
        """
        Test that a node resets to 2D after reducing the workload.
        """
        # Initialize and force a transition to 4D.
        node = DimensionalNode(id=1, workload=1.0, threshold=0.7, buffer_limit=3)
        for _ in range(5):
            node.update()
        
        # Now artificially force a low workload to reset.
        for _ in range(5):
            node.workload = 0.0
            node.update()
        
        self.assertEqual(node.dimension, 2, "Node should revert back to 2D after sustained low workload.")

    def test_buffer_behavior(self):
        """
        Test that the transition buffer only increases when the workload is high.
        """
        node = DimensionalNode(id=2, workload=0.5, threshold=0.7, buffer_limit=3)
        initial_buffer = node.transition_buffer
        node.update()
        self.assertTrue(
            node.transition_buffer <= initial_buffer + 1,
            "Buffer should increase by at most 1 on a single update when conditions are met."
        )

# === Main Execution ===
if __name__ == "__main__":
    # Run a full simulation
    simulation_history = simulate_nodes(num_nodes=10, steps=50)
    visualize_simulation(simulation_history)
    
    # Uncomment the line below to run unit tests instead of the simulation.
    # unittest.main()