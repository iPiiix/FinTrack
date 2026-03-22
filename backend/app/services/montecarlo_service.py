"""
Monte Carlo simulation for financial projections.
Projects future net worth based on historical cash flow volatility.
"""
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any


def run_simulation(
    monthly_flows: List[float],
    current_net_worth: float,
    months_ahead: int = 12,
    n_simulations: int = 1000
) -> Dict[str, Any]:
    """
    Run Monte Carlo simulation based on historical monthly cash flows.
    
    Args:
        monthly_flows: List of net monthly flows (income - expenses) for past months
        current_net_worth: Current total net worth
        months_ahead: Number of months to project (12, 24, or 36)
        n_simulations: Number of simulation paths
    
    Returns:
        Dictionary with percentile paths and summary statistics
    """
    if len(monthly_flows) < 3:
        return {
            "error": "insufficient_data",
            "message": "Se necesitan al menos 3 meses de datos para una proyección fiable.",
            "paths": {},
            "summary": {}
        }
    
    flows = np.array(monthly_flows, dtype=np.float64)
    mean_flow = float(np.mean(flows))
    std_flow = float(np.std(flows, ddof=1)) if len(flows) > 1 else abs(mean_flow) * 0.2
    
    # Prevent zero std (would produce flat projections)
    if std_flow < 0.01:
        std_flow = abs(mean_flow) * 0.15 if mean_flow != 0 else 100.0
    
    # Run simulations with local RNG (avoids polluting global numpy state)
    rng = np.random.default_rng(42)
    all_paths = np.zeros((n_simulations, months_ahead + 1))
    all_paths[:, 0] = current_net_worth
    
    for t in range(1, months_ahead + 1):
        random_flows = rng.normal(mean_flow, std_flow, n_simulations)
        all_paths[:, t] = all_paths[:, t - 1] + random_flows
    
    # Calculate percentiles
    percentiles = {
        "p10": np.percentile(all_paths, 10, axis=0).tolist(),
        "p25": np.percentile(all_paths, 25, axis=0).tolist(),
        "p50": np.percentile(all_paths, 50, axis=0).tolist(),
        "p75": np.percentile(all_paths, 75, axis=0).tolist(),
        "p90": np.percentile(all_paths, 90, axis=0).tolist(),
    }
    
    # Generate month labels
    now = datetime.now()
    labels = [(now + timedelta(days=30 * i)).strftime("%b %Y") for i in range(months_ahead + 1)]
    
    # Summary statistics at final month
    final_values = all_paths[:, -1]
    coefficient_of_variation = float(np.std(final_values) / abs(np.mean(final_values))) if np.mean(final_values) != 0 else 0
    
    return {
        "paths": percentiles,
        "labels": labels,
        "summary": {
            "median_final": round(float(np.median(final_values)), 2),
            "best_case": round(float(np.percentile(final_values, 90)), 2),
            "worst_case": round(float(np.percentile(final_values, 10)), 2),
            "mean_monthly_flow": round(mean_flow, 2),
            "flow_volatility": round(std_flow, 2),
            "high_variability": coefficient_of_variation > 1.5,
            "months_projected": months_ahead
        }
    }
