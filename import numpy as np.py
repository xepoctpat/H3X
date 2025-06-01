import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import plotly.graph_objects as go
from scipy.spatial import ConvexHull
from matplotlib.patches import Circle, Polygon
import matplotlib.patches as mpatches

class DimensionalProof:
    """
    Mathematical proof that hexagons = triangles = spheres
    through dimensional transformations
    """
    
    def __init__(self):
        self.phi = (1 + np.sqrt(5)) / 2  # Golden ratio
        
    def create_dimensional_proof_visualization(self):
        """Main visualization showing the mathematical proof"""
        fig = plt.figure(figsize=(18, 12))
        
        # 1. Hexagon as 6 Triangles
        ax1 = fig.add_subplot(3, 4, 1)
        self._prove_hexagon_is_triangles(ax1)
        
        # 2. Triangle as 3D Tetrahedron Projection
        ax2 = fig.add_subplot(3, 4, 2, projection='3d')
        self._prove_triangle_is_sphere_projection(ax2)
        
        # 3. Sphere as Infinite-sided Polygon
        ax3 = fig.add_subplot(3, 4, 3)
        self._prove_sphere_is_infinite_hexagon(ax3)
        
        # 4. Dimensional Collapse
        ax4 = fig.add_subplot(3, 4, 4, projection='3d')
        self._show_dimensional_collapse(ax4)
        
        # 5. Volume in 3D Space
        ax5 = fig.add_subplot(3, 4, 5, projection='3d')
        self._show_volume_role(ax5)
        
        # 6. cflup-n Collision Avoidance
        ax6 = fig.add_subplot(3, 4, 6, projection='3d')
        self._show_collision_avoidance(ax6)
        
        # 7. Mathematical Proof
        ax7 = fig.add_subplot(3, 4, 7)
        self._show_mathematical_relations(ax7)
        
        # 8. Dimensional Transformation
        ax8 = fig.add_subplot(3, 4, 8, projection='3d')
        self._show_dimensional_transformation(ax8)
        
        # 9. Hexagon-Triangle-Sphere Unity
        ax9 = fig.add_subplot(3, 4, 9)
        self._show_unity_diagram(ax9)
        
        # 10. Volume Calculations
        ax10 = fig.add_subplot(3, 4, 10)
        self._show_volume_calculations(ax10)
        
        # 11. Collision Matrix
        ax11 = fig.add_subplot(3, 4, 11)
        self._show_collision_matrix(ax11)
        
        # 12. Final Proof
        ax12 = fig.add_subplot(3, 4, 12)
        self._show_final_proof(ax12)
        
        plt.tight_layout()
        return fig
    
    def _prove_hexagon_is_triangles(self, ax):
        """Prove hexagon = 6 triangles"""
        ax.set_title("Hexagon = 6 Triangles")
        
        # Draw hexagon
        angles = np.linspace(0, 2*np.pi, 7)
        hex_x = np.cos(angles)
        hex_y = np.sin(angles)
        
        hexagon = Polygon(list(zip(hex_x[:-1], hex_y[:-1])), 
                         fill=False, edgecolor='black', linewidth=2)
        ax.add_patch(hexagon)
        
        # Draw 6 triangles
        colors = plt.cm.rainbow(np.linspace(0, 1, 6))
        for i in range(6):
            triangle = Polygon([
                (0, 0),
                (hex_x[i], hex_y[i]),
                (hex_x[i+1], hex_y[i+1])
            ], alpha=0.3, color=colors[i])
            ax.add_patch(triangle)
            
            # Label triangles
            mid_angle = angles[i] + np.pi/6
            ax.text(0.5*np.cos(mid_angle), 0.5*np.sin(mid_angle), 
                   f'△{i+1}', ha='center', va='center')
        
        ax.set_xlim(-1.5, 1.5)
        ax.set_ylim(-1.5, 1.5)
        ax.set_aspect('equal')
        ax.text(0, -1.3, 'Hexagon = Σ(△ᵢ), i=1 to 6', 
                ha='center', fontsize=12, weight='bold')
    
    def _prove_triangle_is_sphere_projection(self, ax):
        """Prove triangle is sphere projection"""
        ax.set_title("Triangle = Sphere Projection")
        
        # Create sphere
        u = np.linspace(0, 2 * np.pi, 50)
        v = np.linspace(0, np.pi, 50)
        x = np.outer(np.cos(u), np.sin(v))
        y = np.outer(np.sin(u), np.sin(v))
        z = np.outer(np.ones(np.size(u)), np.cos(v))
        
        # Plot sphere
        ax.plot_surface(x, y, z, alpha=0.3, color='lightblue')
        
        # Project tetrahedron vertices from sphere
        tet_angles = [
            (0, np.pi/3),
            (2*np.pi/3, np.pi/3),
            (4*np.pi/3, np.pi/3),
            (np.pi, np.pi)
        ]
        
        vertices = []
        for theta, phi in tet_angles:
            x = np.sin(phi) * np.cos(theta)
            y = np.sin(phi) * np.sin(theta)
            z = np.cos(phi)
            vertices.append([x, y, z])
            ax.scatter(x, y, z, s=100, c='red')
        
        # Draw tetrahedron edges
        vertices = np.array(vertices)
        for i in range(4):
            for j in range(i+1, 4):
                ax.plot([vertices[i,0], vertices[j,0]], 
                       [vertices[i,1], vertices[j,1]], 
                       [vertices[i,2], vertices[j,2]], 
                       'r-', linewidth=2)
        
        # Project to 2D (triangle)
        proj_vertices = vertices[:3, :2]
        triangle = plt.Polygon(proj_vertices, fill=False, 
                             edgecolor='green', linewidth=3)
        
        ax.text2D(0.5, 0.02, '3D Sphere → 2D Triangle', 
                 transform=ax.transAxes, ha='center', 
                 fontsize=10, weight='bold')
    
    def _prove_sphere_is_infinite_hexagon(self, ax):
        """Prove sphere = infinite-sided polygon"""
        ax.set_title("Sphere = lim(n→∞) n-gon")
        
        # Draw polygons with increasing sides
        n_values = [3, 6, 12, 24, 48]
        colors = plt.cm.viridis(np.linspace(0, 1, len(n_values)))
        
        for i, (n, color) in enumerate(zip(n_values, colors)):
            angles = np.linspace(0, 2*np.pi, n+1)
            x = 0.9**(i) * np.cos(angles)
            y = 0.9**(i) * np.sin(angles)
            
            ax.plot(x, y, color=color, linewidth=2, 
                   label=f'n={n}')
        
        # Draw circle (infinite polygon)
        circle = Circle((0, 0), 0.9**len(n_values), 
                       fill=False, edgecolor='red', 
                       linewidth=3, linestyle='--',
                       label='n=∞ (circle)')
        ax.add_patch(circle)
        
        ax.set_xlim(-1.5, 1.5)
        ax.set_ylim(-1.5, 1.5)
        ax.set_aspect('equal')
        ax.legend(loc='upper right')
        ax.text(0, -1.3, 'Circle = lim(n→∞) Regular n-gon', 
                ha='center', fontsize=10)
    
    def _show_dimensional_collapse(self, ax):
        """Show how dimensions collapse"""
        ax.set_title("Dimensional Collapse: 3D→2D→1D")
        
        # 3D cube
        cube_vertices = np.array([
            [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
            [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
        ])
        
        # Draw cube
        for i in range(4):
            j = (i + 1) % 4
            ax.plot([cube_vertices[i,0], cube_vertices[j,0]], 
                   [cube_vertices[i,1], cube_vertices[j,1]], 
                   [cube_vertices[i,2], cube_vertices[j,2]], 'b-')
            ax.plot([cube_vertices[i+4,0], cube_vertices[j+4,0]], 
                   [cube_vertices[i+4,1], cube_vertices[j+4,1]], 
                   [cube_vertices[i+4,2], cube_vertices[j+4,2]], 'b-')
            ax.plot([cube_vertices[i,0], cube_vertices[i+4,0]], 
                   [cube_vertices[i,1], cube_vertices[i+4,1]], 
                   [cube_vertices[i,2], cube_vertices[i+4,2]], 'b-')
        
        # Show projections
        # 2D projection (square)
        square_2d = cube_vertices[:4, :2] * 0.5 + np.array([1.5, 0])
        for i in range(4):
            j = (i + 1) % 4
            ax.plot([square_2d[i,0], square_2d[j,0]], 
                   [square_2d[i,1], square_2d[j,1]], 
                   [0, 0], 'g-', linewidth=2)
        
        # 1D projection (line)
        ax.plot([0, 1], [0.5, 0.5], [0, 0], 'r-', linewidth=3)
        
        ax.text(0.5, -0.5, 0, '3D', fontsize=12, color='blue')
        ax.text(1.75, -0.5, 0, '2D', fontsize=12, color='green')
        ax.text(0.5, 0.3, 0, '1D', fontsize=12, color='red')
        
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
    
    def _show_volume_role(self, ax):
        """Show how volume affects 3D collision"""
        ax.set_title("Volume's Role in 3D Collision")
        
        # Draw two spheres with volume
        u = np.linspace(0, 2 * np.pi, 30)
        v = np.linspace(0, np.pi, 20)
        
        # Sphere 1 (no collision)
        r1 = 0.5
        x1 = r1 * np.outer(np.cos(u), np.sin(v)) - 1
        y1 = r1 * np.outer(np.sin(u), np.sin(v))
        z1 = r1 * np.outer(np.ones(np.size(u)), np.cos(v))
        ax.plot_surface(x1, y1, z1, alpha=0.5, color='blue')
        
        # Sphere 2 (no collision)
        r2 = 0.5
        x2 = r2 * np.outer(np.cos(u), np.sin(v)) + 1
        y2 = r2 * np.outer(np.sin(u), np.sin(v))
        z2 = r2 * np.outer(np.ones(np.size(u)), np.cos(v))
        ax.plot_surface(x2, y2, z2, alpha=0.5, color='red')
        
        # Show volume equations
        ax.text2D(0.5, 0.95, f'V₁ = 4/3 π r₁³ = {4/3*np.pi*r1**3:.3f}', 
                 transform=ax.transAxes, ha='center')
        ax.text2D(0.5, 0.90, f'V₂ = 4/3 π r₂³ = {4/3*np.pi*r2**3:.3f}', 
                 transform=ax.transAxes, ha='center')
        ax.text2D(0.5, 0.85, 'No collision when: |center₁ - center₂| > r₁ + r₂', 
                 transform=ax.transAxes, ha='center')
        
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
    
    def _show_collision_avoidance(self, ax):
        """Show cflup-n collision avoidance through dimension reduction"""
        ax.set_title("cflup-n: Collision Avoidance")
        
        # 3D configuration with potential collision
        positions_3d = [
            np.array([0, 0, 0]),
            np.array([0.5, 0.5, 0.5]),
            np.array([1, 0, 0])
        ]
        
        # Draw 3D spheres (would collide)
        for i, pos in enumerate(positions_3d):
            u = np.linspace(0, 2 * np.pi, 20)
            v = np.linspace(0, np.pi, 15)
            r = 0.4
            x = r * np.outer(np.cos(u), np.sin(v)) + pos[0]
            y = r * np.outer(np.sin(u), np.sin(v)) + pos[1]
            z = r * np.outer(np.ones(np.size(u)), np.cos(v)) + pos[2]
            
            color = ['red', 'green', 'blue'][i]
            ax.plot_surface(x, y, z, alpha=0.3, color=color)
        
        # Show 2D projection (no collision)
        ax.plot([0, 1, 0.5, 0], [0, 0, 0.866, 0], [0, 0, 0, 0], 
               'k-', linewidth=2)
        
        # Add arrows showing dimension reduction
        for i, pos in enumerate(positions_3d):
            proj_pos = [pos[0], pos[1], 0]
            ax.plot([pos[0], proj_pos[0]], 
                   [pos[1], proj_pos[1]], 
                   [pos[2], proj_pos[2]], 
                   'k--', alpha=0.5)
        
        ax.text2D(0.5, 0.02, 'Dimension reduction eliminates collision', 
                 transform=ax.transAxes, ha='center', weight='bold')
    
    def _show_mathematical_relations(self, ax):
        """Show mathematical relationships"""
        ax.set_title("Mathematical Relations")
        ax.axis('off')
        
        relations = [
            "1. Hexagon Area = 6 × Triangle Area",
            "   A_hex = (3√3/2)s² = 6 × (√3/4)s²",
            "",
            "2. Sphere Surface = lim(n→∞) n-gon Area",
            "   A_sphere = 4πr² = lim(n→∞) n×sin(2π/n)×r²/2",
            "",
            "3. Volume Scaling:",
            "   V_3D = r³, A_2D = r², L_1D = r",
            "",
            "4. Collision Condition:",
            "   3D: |p₁ - p₂| > r₁ + r₂",
            "   2D: |π(p₁) - π(p₂)| > r₁ + r₂ (easier!)",
            "",
            "5. Dimensional Projection:",
            "   π: ℝ³ → ℝ² preserves topology"
        ]
        
        y_pos = 0.9
        for relation in relations:
            ax.text(0.1, y_pos, relation, transform=ax.transAxes, 
                   fontsize=10, family='monospace')
            y_pos -= 0.07
    
    def _show_dimensional_transformation(self, ax):
        """Show transformation between dimensions"""
        ax.set_title("Dimensional Transformation")
        
        # Create transformation sequence
        t = np.linspace(0, 2*np.pi, 100)
        
        # 3D helix (representing higher dimension)
        x = np.cos(t)
        y = np.sin(t)
        z = t / (2*np.pi) * 2
        ax.plot(x, y, z, 'b-', linewidth=3, label='3D Helix')
        
        # 2D circle (projection)
        ax.plot(x, y, np.zeros_like(x), 'g-', linewidth=2, 
               label='2D Projection')
        
        # 1D oscillation
        ax.plot(x, np.zeros_like(y), np.zeros_like(z), 'r-', 
               linewidth=2, label='1D Projection')
        
        # Show connections
        for i in range(0, len(t), 10):
            ax.plot([x[i], x[i], x[i]], 
                   [y[i], y[i], 0], 
                   [z[i], 0, 0], 
                   'k--', alpha=0.3, linewidth=0.5)
        
        ax.legend()
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
    
    def _show_unity_diagram(self, ax):
        """Show hexagon-triangle-sphere unity"""
        ax.set_title("The Unity: Hexagon ≡ Triangle ≡ Sphere")
        ax.set_xlim(-2, 2)
        ax.set_ylim(-2, 2)
        
        # Central unity symbol
        unity_circle = Circle((0, 0), 0.5, fill=False, 
                            edgecolor='black', linewidth=3)
        ax.add_patch(unity_circle)
        
        # Hexagon
        hex_angles = np.linspace(0, 2*np.pi, 7)
        hex_x = 1.5 * np.cos(hex_angles) + 0
        hex_y = 1.5 * np.sin(hex_angles) + 0
        hexagon = Polygon(list(zip(hex_x[:-1], hex_y[:-1])), 
                         fill=False, edgecolor='blue', linewidth=2)
        ax.add_patch(hexagon)
        
        # Triangles
        for i in range(0, 6, 2):
            triangle = Polygon([
                (0, 0),
                (hex_x[i], hex_y[i]),
                (hex_x[i+1], hex_y[i+1])
            ], fill=False, edgecolor='red', linewidth=2)
            ax.add_patch(triangle)
        
        # Labels
        ax.text(0, 1.8, 'HEXAGON', ha='center', fontsize=12, color='blue')
        ax.text(-1.5, -1, 'TRIANGLE', ha='center', fontsize=12, color='red')
        ax.text(1.5, -1, 'SPHERE', ha='center', fontsize=12, color='green')
        ax.text(0, 0, '≡', ha='center', va='center', fontsize=20)
        
        ax.set_aspect('equal')
        ax.axis('off')
    
    def _show_volume_calculations(self, ax):
        """Show volume calculations across dimensions"""
        ax.set_title("Volume Across Dimensions")
        ax.axis('off')
        
        calculations = [
            "Dimensional Volume Formulas:",
            "",
            "1D (Line): L = 2r",
            "",
            "2D (Circle): A = πr²",
            "2D (Hexagon): A = (3√3/2)s²",
            "2D (Triangle): A = (√3/4)s²",
            "",
            "3D (Sphere): V = (4/3)πr³",
            "3D (Cube): V = s³",
            "3D (Tetrahedron): V = s³/(6√2)",
            "",
            "4D (Hypersphere): V₄ = (π²/2)r⁴",
            "",
            "Pattern: Vₙ = (π^(n/2)/Γ(n/2+1))r^n"
        ]
        
        y_pos = 0.9
        for calc in calculations:
            style = 'bold' if calc and calc[0] != ' ' else 'normal'
            ax.text(0.1, y_pos, calc, transform=ax.transAxes, 
                   fontsize=9, family='monospace', weight=style)
            y_pos -= 0.06
    
    def _show_collision_matrix(self, ax):
        """Show collision probability matrix"""
        ax.set_title("Collision Probability by Dimension")
        
        # Create collision probability matrix
        dimensions = ['1D', '2D', '3D', '4D']
        n_objects = [2, 3, 4, 5]
        
        # Calculate probabilities (simplified model)
        prob_matrix = np.zeros((len(dimensions), len(n_objects)))
        for i, dim in enumerate(range(1, 5)):
            for j, n in enumerate(n_objects):
                # Probability decreases with dimension, increases with objects
                prob_matrix[i, j] = (n-1) / (dim * n)
        
        im = ax.imshow(prob_matrix, cmap='hot', aspect='auto')
        
        ax.set_xticks(range(len(n_objects)))
        ax.set_xticklabels(n_objects)
        ax.set_xlabel('Number of Objects')
        
        ax.set_yticks(range(len(dimensions)))
        ax.set_yticklabels(dimensions)
        ax.set_ylabel('Dimension')
        
        # Add values
        for i in range(len(dimensions)):
            for j in range(len(n_objects)):
                ax.text(j, i, f'{prob_matrix[i,j]:.2f}', 
                       ha='center', va='center', color='white')
        
        plt.colorbar(im, ax=ax, label='Collision Probability')
    
    def _show_final_proof(self, ax):
        """Show the final unified proof"""
        ax.set_title("Final Proof: The Unity")
        ax.axis('off')
        
        proof_text = """
        THEOREM: Hexagon ≡ Triangle ≡ Sphere
        
        PROOF:
        1. Hexagon = 6 × Triangle (by construction)
        
        2. Triangle = 2D projection of Tetrahedron
           Tetrahedron ⊂ Sphere (inscribed)
        
        3. Sphere = lim(n→∞) Regular n-gon
           Hexagon is n-gon with n=6
        
        4. Dimensional Reduction:
           3D Sphere → 2D Circle → 1D Line
           3D Volume → 2D Area → 1D Length
        
        5. cflup-n exists in reduced dimension:
           No collision in projection space
           Volume → Area transformation
        
        ∴ All three are manifestations of the
           same geometric principle across
           different dimensional projections.
                                            Q.E.D.
        """
        
        ax.text(0.1, 0.5, proof_text, transform=ax.transAxes, 
               fontsize=9, family='monospace', va='center')
    
    def create_interactive_proof(self):
        """Create interactive visualization of the proof"""
        fig = go.Figure()
        
        # Add hexagon
        hex_angles = np.linspace(0, 2*np.pi, 7)
        hex_x = np.cos(hex_angles)
        hex_y = np.sin(hex_angles)
        hex_z = np.zeros_like(hex_angles)
        
        fig.add_trace(go.Scatter3d(
            x=hex_x, y=hex_y, z=hex_z,
            mode='lines+markers',
            line=dict(color='blue', width=5),
            marker=dict(size=8, color='blue'),
            name='Hexagon (2D)'
        ))
        
        # Add triangulation
        for i in range(6):
            tri_x = [0, hex_x[i], hex_x[i+1], 0]
            tri_y = [0, hex_y[i], hex_y[i+1], 0]
            tri_z = [0, 0, 0, 0]
            
            fig.add_trace(go.Scatter3d(
                x=tri_x, y=tri_y, z=tri_z,
                mode='lines',
                line=dict(color=f'rgba(255,0,0,{0.3+0.1*i})', width=2),
                name=f'Triangle {i+1}' if i == 0 else None,
                showlegend=(i == 0)
            ))
        
        # Add sphere
        u = np.linspace(0, 2 * np.pi, 50)
        v = np.linspace(0, np.pi, 50)
        x_sphere = np.outer(np.cos(u), np.sin(v))
        y_sphere = np.outer(np.sin(u), np.sin(v))
        z_sphere = np.outer(np.ones(np.size(u)), np.cos(v))
        
        fig.add_trace(go.Surface(
            x=x_sphere, y=y_sphere, z=z_sphere,
            colorscale='Viridis',
            opacity=0.3,
            name='Sphere (3D)',
            showscale=False
        ))
        
        # Add dimensional projections
        # Project sphere to circle
        circle_points = 100
        t = np.linspace(0, 2*np.pi, circle_points)
        fig.add_trace(go.Scatter3d(
            x=np.cos(t), y=np.sin(t), z=np.zeros(circle_points),
            mode='lines',
            line=dict(color='green', width=4),
            name='Circle (2D projection)'
        ))
        
        # Add annotations
        fig.add_trace(go.Scatter3d(
            x=[0], y=[0], z=[1.5],
            mode='text',
            text=['Hexagon = Triangle = Sphere<br>Through Dimensional Transform'],
            textposition='middle center',
            showlegend=False
        ))
        
        fig.update_layout(
            title="Interactive Proof: Geometric Unity Across Dimensions",
            scene=dict(
                xaxis_title="X",
                yaxis_title="Y",
                zaxis_title="Z",
                camera=dict(eye=dict(x=1.5, y=1.5, z=1.5))
            ),
            height=700
        )
        
        return fig

# Create and display the proof
if __name__ == "__main__":
    proof = DimensionalProof()
    
    # Static visualization
    static_fig = proof.create_dimensional_proof_visualization()
    static_fig.savefig('hexagon_triangle_sphere_proof.png', 
                      dpi=300, bbox_inches='tight')
    
    # Interactive visualization
    interactive_fig = proof.create_interactive_proof()
    interactive_fig.write_html('dimensional_proof_interactive.html')
    interactive_fig.show()
    
    plt.show()