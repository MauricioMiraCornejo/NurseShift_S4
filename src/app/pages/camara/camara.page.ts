import { Component, OnInit } from '@angular/core';
import { ToastController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.page.html',
  styleUrls: ['./camara.page.scss'],
  standalone: false,
})
export class CamaraPage implements OnInit {
  photos: any[] = [];
  currentPhoto: any = null;
  loading: boolean = false;
  isWeb: boolean = false;

  constructor(
    private toastController: ToastController,
    private platform: Platform
  ) {
    // Detectar si es web
    this.isWeb = !this.platform.is('android') && !this.platform.is('ios');
    console.log('🌐 ¿Es Web?', this.isWeb);
  }

  ngOnInit() { }

  async tomarFoto() {
    this.loading = true;

    try {
      
      const status = await Camera.requestPermissions();

      if (status.camera !== 'granted') {
        this.mostrarToast('Permiso de cámara denegado');
        this.loading = false;
        return;
      }

      const options = {
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: true
      };

      const photo = await Camera.getPhoto(options);
      const savedPhoto = await this.guardarFoto(photo);

      this.currentPhoto = savedPhoto;
      this.photos.unshift({
        path: savedPhoto.webPath || savedPhoto.path,
        timestamp: new Date().toISOString(),
        data: savedPhoto
      });

      this.loading = false;
      this.mostrarToast('Foto tomada correctamente');
      console.log('Foto tomada:', photo);

    } catch (error: any) {
      console.error('Error al tomar foto:', error);
           
      if (error.message?.includes('Not implemented on web') || this.isWeb) {
        console.log('🔄 Usando fallback manual para web');
        this.tomarFotoManual();
        this.loading = false;
        return;
      }

      this.loading = false;

      if (error instanceof Error && error.message.includes('cancel')) {
        this.mostrarToast('Captura cancelada');
      } else {
        this.mostrarToast('Error al tomar la foto');
      }
    }
  }
  
  tomarFotoManual() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const photo = {
            webPath: e.target.result,
            path: e.target.result,
            timestamp: new Date().toISOString(),
            format: file.type.split('/')[1] || 'jpg',
            data: { savedPath: null },
            isManual: true
          };
          
          this.currentPhoto = photo;
          this.photos.unshift(photo);
          this.mostrarToast('📷 Foto capturada en web');
          this.loading = false;
        };
        reader.readAsDataURL(file);
      } else {
        this.loading = false;
      }
    };
    
    input.oncancel = () => {
      this.loading = false;
      this.mostrarToast('Captura cancelada');
    };
    
    input.click();
  }

  async guardarFoto(photo: any) {
    try {
      const base64Data = await this.readAsBase64(photo);
      const fileName = `photo_${Date.now()}.jpg`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data
      });

      return {
        ...photo,
        savedPath: savedFile.uri,
        fileName: fileName
      };

    } catch (error) {
      console.error('Error al guardar foto:', error);
      return photo;
    }
  }

  async readAsBase64(photo: any) {
    try {
      if (photo.base64String) {
        return photo.base64String;
      }

      if (photo.path) {
        const response = await fetch(photo.path);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      return null;

    } catch (error) {
      console.error('Error al leer foto como base64:', error);
      return null;
    }
  }

  async seleccionarDeGaleria() {
    this.loading = true;

    try {
     
      const status = await Camera.requestPermissions();

      if (status.camera !== 'granted') {
        this.mostrarToast('Permiso de almacenamiento denegado');
        this.loading = false;
        return;
      }

      const options = {
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        saveToGallery: false
      };

      const photo = await Camera.getPhoto(options);

      this.currentPhoto = photo;
      this.photos.unshift({
        path: photo.webPath || photo.path,
        timestamp: new Date().toISOString(),
        data: photo
      });

      this.loading = false;
      this.mostrarToast('Foto seleccionada de galería');
      console.log('Foto seleccionada:', photo);

    } catch (error: any) {
      console.error('Error al seleccionar foto:', error);
            
      if (error.message?.includes('Not implemented on web') || this.isWeb) {
        console.log('🔄 Usando fallback manual para web');
        this.seleccionarGaleriaManual();
        this.loading = false;
        return;
      }

      this.loading = false;

      if (error instanceof Error && error.message.includes('cancel')) {
        this.mostrarToast('Selección cancelada');
      } else {
        this.mostrarToast('Error al seleccionar la foto');
      }
    }
  }

  seleccionarGaleriaManual() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const photo = {
            webPath: e.target.result,
            path: e.target.result,
            timestamp: new Date().toISOString(),
            format: file.type.split('/')[1] || 'jpg',
            data: { savedPath: null },
            isManual: true
          };
          
          this.currentPhoto = photo;
          this.photos.unshift(photo);
          this.mostrarToast('📷 Foto seleccionada de galería web');
          this.loading = false;
        };
        reader.readAsDataURL(file);
      } else {
        this.loading = false;
      }
    };
    
    input.oncancel = () => {
      this.loading = false;
      this.mostrarToast('Selección cancelada');
    };
    
    input.click();
  }

  async eliminarFoto(index: number) {
    const photo = this.photos[index];

    if (photo.data?.savedPath && !photo.isManual) {
      try {
        await Filesystem.deleteFile({
          path: photo.data.savedPath
        });
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
      }
    }

    this.photos.splice(index, 1);

    if (this.currentPhoto && this.photos.length === 0) {
      this.currentPhoto = null;
    }

    this.mostrarToast('🗑️ Foto eliminada de la lista');
  }

  verFoto(index: number) {
    this.currentPhoto = this.photos[index];
  }

  cerrarDetalle() {
    this.currentPhoto = null;
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: mensaje.includes('❌') ? 'danger' : mensaje.includes('✅') ? 'success' : 'primary'
    });
    toast.present();
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}