import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.page.html',
  styleUrls: ['./posts.page.scss'],
  standalone: false,
})
export class PostsPage implements OnInit {
  
  posts: any[] = [];
  apiPosts: any[] = [];
  newPost: any = {
    title: '',
    body: '',
    userId: 1
  };
  selectedPost: any = null;
  isEditing: boolean = false;
  useLocalApi: boolean = true; // true = json-server, false = jsonplaceholder
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarPosts();
  }
  
  cargarPosts() {
    this.loading = true;
    if (this.useLocalApi) {
      this.apiService.getPosts().subscribe({
        next: (data) => {
          this.posts = data;
          this.loading = false;
          console.log('Posts de json-server cargados:', data);
        },
        error: (error) => {
          console.error('Error al cargar posts de json-server:', error);
          this.mostrarToast('Error al cargar posts del servidor local. Asegúrate de que json-server esté ejecutándose.');
          this.loading = false;
        }
      });
    } else {
      this.apiService.getJsonPlaceholderPosts().subscribe({
        next: (data) => {
          this.posts = data.slice(0, 10); // Limitamos a 10 posts para no sobrecargar
          this.loading = false;
          console.log('Posts de JSONPlaceholder cargados:', data);
        },
        error: (error) => {
          console.error('Error al cargar posts de JSONPlaceholder:', error);
          this.mostrarToast('Error al cargar posts de JSONPlaceholder. Verifica tu conexión a internet.');
          this.loading = false;
        }
      });
    }
  }
 
  cambiarApi() {
    this.useLocalApi = !this.useLocalApi;
    this.posts = [];
    this.selectedPost = null;
    this.cargarPosts();
    this.mostrarToast(`Cambiado a ${this.useLocalApi ? 'json-server (local)' : 'JSONPlaceholder (externa)'}`);
  }

  crearPost() {
    if (!this.newPost.title || !this.newPost.body) {
      this.mostrarToast('Por favor, completa todos los campos');
      return;
    }

    this.loading = true;
    if (this.useLocalApi) {
      this.apiService.createPost(this.newPost).subscribe({
        next: (data) => {
          this.posts.unshift(data);
          this.limpiarFormulario();
          this.loading = false;
          this.mostrarToast('Post creado correctamente en json-server');
        },
        error: (error) => {
          console.error('Error al crear post:', error);
          this.mostrarToast('Error al crear el post');
          this.loading = false;
        }
      });
    } else {
      this.apiService.createJsonPlaceholderPost(this.newPost).subscribe({
        next: (data) => {
          this.posts.unshift(data);
          this.limpiarFormulario();
          this.loading = false;
          this.mostrarToast('Post creado correctamente en JSONPlaceholder');
        },
        error: (error) => {
          console.error('Error al crear post:', error);
          this.mostrarToast('Error al crear el post');
          this.loading = false;
        }
      });
    }
  }
  
  editarPost(post: any) {
    this.selectedPost = { ...post };
    this.isEditing = true;
    this.newPost.title = post.title;
    this.newPost.body = post.body;
    this.newPost.userId = post.userId;
  }
  
  actualizarPost() {
    if (!this.selectedPost || !this.newPost.title || !this.newPost.body) {
      this.mostrarToast('Por favor, completa todos los campos');
      return;
    }

    this.loading = true;
    if (this.useLocalApi) {
      this.apiService.updatePost(this.selectedPost.id, this.newPost).subscribe({
        next: (data) => {
          const index = this.posts.findIndex(p => p.id === this.selectedPost.id);
          if (index !== -1) {
            this.posts[index] = { ...this.newPost, id: this.selectedPost.id };
          }
          this.limpiarFormulario();
          this.loading = false;
          this.mostrarToast('Post actualizado correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar post:', error);
          this.mostrarToast('Error al actualizar el post');
          this.loading = false;
        }
      });
    } else {
      this.apiService.updateJsonPlaceholderPost(this.selectedPost.id, this.newPost).subscribe({
        next: (data) => {
          const index = this.posts.findIndex(p => p.id === this.selectedPost.id);
          if (index !== -1) {
            this.posts[index] = { ...this.newPost, id: this.selectedPost.id };
          }
          this.limpiarFormulario();
          this.loading = false;
          this.mostrarToast('Post actualizado correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar post:', error);
          this.mostrarToast('Error al actualizar el post');
          this.loading = false;
        }
      });
    }
  }
  
  eliminarPost(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este post?')) {
      return;
    }

    this.loading = true;
    if (this.useLocalApi) {
      this.apiService.deletePost(id).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== id);
          this.loading = false;
          this.mostrarToast('Post eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar post:', error);
          this.mostrarToast('Error al eliminar el post');
          this.loading = false;
        }
      });
    } else {
      this.apiService.deleteJsonPlaceholderPost(id).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== id);
          this.loading = false;
          this.mostrarToast('Post eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar post:', error);
          this.mostrarToast('Error al eliminar el post');
          this.loading = false;
        }
      });
    }
  }

  limpiarFormulario() {
    this.newPost = {
      title: '',
      body: '',
      userId: 1
    };
    this.selectedPost = null;
    this.isEditing = false;
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: mensaje.includes('Error') ? 'danger' : 'success'
    });
    toast.present();
  }
}