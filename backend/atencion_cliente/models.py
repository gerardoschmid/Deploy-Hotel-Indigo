from django.db import models


class AtencionCliente(models.Model):
    id = models.IntegerField(primary_key=True)
    usuario_id = models.IntegerField(null=True)
    tipo_atencion = models.TextField(null=True)

    class Meta:
        db_table = 'atencion_cliente'
        managed = True

    def __str__(self):
        return str(self.id)
