from runtime_analyzer.domain.models import Node


def get_nodes_total_energy_difference_for_access_metric(baseline_nodes: list[Node], modified_nodes: list[Node]) -> \
        tuple[int, int, int, int]:
    """
    Calculates the total energy difference for access metric between baseline and modified nodes.
    Returns a tuple containing the difference for read counter, write counter, read size, and write size.

    :param baseline_nodes: 
    :param modified_nodes: 
    """
    (baseline_read_counter,
     baseline_write_counter,
     baseline_read_size,
     baseline_write_size) = get_nodes_energy_for_access_metric(baseline_nodes)
    (modified_read_counter,
     modified_write_counter,
     modified_read_size,
     modified_write_size) = get_nodes_energy_for_access_metric(modified_nodes)

    return (modified_read_counter - baseline_read_counter,
            modified_write_counter - baseline_write_counter,
            modified_read_size - baseline_read_size,
            modified_write_size - baseline_write_size)


def get_nodes_energy_for_access_metric(nodes: list[Node]) -> tuple[int, int, int, int]:
    """
    Calculates the total energy for access metric for a list of nodes.

    :param nodes: 
    """
    nodes_read_counter = 0
    nodes_read_size = 0
    nodes_write_counter = 0
    nodes_write_size = 0

    for node in nodes:
        if node.energy is None:
            continue

        nodes_read_counter += node.energy.readCounter
        nodes_write_counter += node.energy.writeCounter
        nodes_read_size += node.energy.readCounter * node.energy.size
        nodes_write_size += node.energy.writeCounter * node.energy.size

    return nodes_read_counter, nodes_write_counter, nodes_read_size, nodes_write_size
