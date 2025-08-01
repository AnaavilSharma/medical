# Generated by Django 5.2.1 on 2025-06-21 17:57

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=255)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('due_date', models.DateField()),
                ('payment_link', models.URLField(blank=True, help_text='Optional link to a payment gateway', null=True)),
                ('late_fine', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('payment_proof', models.FileField(blank=True, null=True, upload_to='payment_proofs/')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('received', 'Received'), ('pending_proof', 'Pending Proof')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
