from django.db import models


class InsumoProducto(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.TextField(null=True)
    stock_actual = models.IntegerField(null=True)

    class Meta:
        db_table = 'insumo_producto'
        managed = True

    def __str__(self):
        return self.nombre or str(self.id)
