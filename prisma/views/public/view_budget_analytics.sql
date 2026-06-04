SELECT
  id,
  created_at,
  project_name,
  client_name,
  total_amount,
  paid_amount,
  (total_amount - paid_amount) AS balance_due,
  STATUS,
  CASE
    WHEN (total_amount > (0) :: numeric) THEN round(
      ((paid_amount / total_amount) * (100) :: numeric),
      2
    )
    ELSE (0) :: numeric
  END AS percent_paid
FROM
  budgets b;