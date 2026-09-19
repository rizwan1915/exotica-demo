import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Text

def create_logo():
    # Create a new figure
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)

    # Add a circular background
    circle = Circle((5, 5), 4.5, color='crimson', ec='gold', lw=3)
    ax.add_patch(circle)

    # Add text for the logo
    ax.text(5, 5, "House of\nVivian Exotica", ha='center', va='center',
            fontsize=24, fontweight='bold', color='gold', fontname='serif')

    # Add decorative elements like a stylized rose (simplified)
    ax.plot([5, 3], [5, 7], color='gold', lw=2)  # Example line for rose stem
    ax.plot([3, 2.5, 3.5], [7, 8, 8], color='gold', lw=2)  # Example simplistic rose shape

    # Remove axes
    ax.axis('off')
    plt.savefig("house_of_vivian_logo.png", bbox_inches='tight', dpi=300)
    plt.show()

create_logo()