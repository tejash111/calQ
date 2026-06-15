class ImageStore {
  private base64: string = '';

  setBase64(base64: string) {
    this.base64 = base64;
  }

  getBase64(): string {
    return this.base64;
  }

  clear() {
    this.base64 = '';
  }
}

export const imageStore = new ImageStore();
