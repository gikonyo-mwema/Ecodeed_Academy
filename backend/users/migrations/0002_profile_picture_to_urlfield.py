"""
Convert profile_picture from ImageField to URLField.

Images are now stored in Cloudinary; the model only holds the URL.
Existing ImageField values (relative paths like 'profile_pics/foo.jpg')
are preserved as-is — they can be cleaned up via a management command
or will be overwritten on next profile update.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="customuser",
            name="profile_picture",
            field=models.URLField(
                blank=True,
                default="",
                help_text="Cloudinary URL for the user profile picture.",
                max_length=1000,
            ),
        ),
    ]
