from django.db import models


class MenuRestaurante(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.TextField(null=True)

    class Meta:
        db_table = 'menu_restaurante'
        managed = True

    def __str__(self):
        return self.nombre or str(self.id)
