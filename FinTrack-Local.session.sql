INSERT INTO usuarios (
    id_usuario,
    nombre,
    apellidos,
    email,
    fecha_nacimiento,
    contrasena,
    creado_en,
    actualizado_en
  )
VALUES (
    'id_usuario:bigint',
    'nombre:character varying',
    'apellidos:character varying',
    'email:character varying',
    'fecha_nacimiento:date',
    'contrasena:text',
    'creado_en:timestamp without time zone',
    'actualizado_en:timestamp without time zone'
  );