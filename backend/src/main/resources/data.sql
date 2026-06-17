INSERT INTO categories (name) VALUES
  ('Alimentação'),
  ('Transporte'),
  ('Moradia'),
  ('Lazer'),
  ('Saúde'),
  ('Educação'),
  ('Salário'),
  ('Investimentos'),
  ('Outros')
ON CONFLICT DO NOTHING;
