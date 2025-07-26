from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from .models import TimetableImage
import tempfile
from PIL import Image

CustomUser = get_user_model()

class TimetableImageModelTest(TestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create_user(username="admin", password="adminpass", role="admin")

        # Create a temporary image file
        image = Image.new('RGB', (100, 100))
        tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg')
        image.save(tmp_file, format='JPEG')
        tmp_file.seek(0)

        self.uploaded_image = SimpleUploadedFile(name='test.jpg', content=tmp_file.read(), content_type='image/jpeg')

    def test_timetable_image_creation(self):
        image_obj = TimetableImage.objects.create(
            batch="MBBS 1st Year A",
            image=self.uploaded_image,
            uploaded_by=self.admin
        )
        self.assertEqual(image_obj.batch, "MBBS 1st Year A")
        self.assertEqual(image_obj.uploaded_by.username, "admin")
        self.assertTrue(image_obj.image.name.endswith('.jpg'))