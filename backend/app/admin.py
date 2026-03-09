from sqladmin import ModelView
from app.models.usuario import Usuario
from app.models.cuenta import Cuenta
from app.models.transaccion import Transaccion
from app.models.categoria import Categoria
from app.models.activo import Activo


class UsuarioAdmin(ModelView, model=Usuario):
    column_list = [
        Usuario.id_usuario, Usuario.nombre, Usuario.apellidos,
        Usuario.email, Usuario.email_verificado, Usuario.creado_en,
    ]
    column_searchable_list = [Usuario.email, Usuario.nombre]
    column_sortable_list = [Usuario.creado_en, Usuario.nombre]
    column_default_sort = ("creado_en", True)
    can_create = False
    can_delete = False
    name = "Usuario"
    name_plural = "Usuarios"
    icon = "fa-solid fa-users"


class CuentaAdmin(ModelView, model=Cuenta):
    column_list = [
        Cuenta.id_cuenta, Cuenta.nombre, Cuenta.tipo,
        Cuenta.balance, Cuenta.divisa, Cuenta.activa, Cuenta.creado_en,
    ]
    column_searchable_list = [Cuenta.nombre]
    column_default_sort = ("creado_en", True)
    can_create = False
    name = "Cuenta"
    name_plural = "Cuentas"
    icon = "fa-solid fa-wallet"


class TransaccionAdmin(ModelView, model=Transaccion):
    column_list = [Transaccion.id_transaccion, Transaccion.nombre, Transaccion.cantidad, Transaccion.tipo]
    column_searchable_list = [Transaccion.nombre]
    column_default_sort = ("fecha", True)
    can_create = False
    can_delete = False
    name = "Transacción"
    name_plural = "Transacciones"
    icon = "fa-solid fa-money-bill-transfer"


class CategoriaAdmin(ModelView, model=Categoria):
    column_list = [
        Categoria.id_categoria, Categoria.nombre, Categoria.descripcion,
    ]
    can_delete = False
    name = "Categoría"
    name_plural = "Categorías"
    icon = "fa-solid fa-tags"
