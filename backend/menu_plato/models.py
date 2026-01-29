from django.db import models


class MenuPlato(models.Model):
    id = models.IntegerField(primary_key=True)
    menu_id = models.IntegerField(null=True)
    plato_id = models.IntegerField(null=True)

    class Meta:
        db_table = 'menu_plato'
        managed = True

    def __str__(self):
        return str(self.id)
