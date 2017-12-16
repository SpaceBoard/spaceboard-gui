<template>
  <div class="box">
    File Box
    Progress: {{ box.data.progress }}%
    <input type="file" @change="onFileSelectChange" />
    <a :href="box.data.link" v-if="box.data.link">Download</a>
    <!-- <button @click="downloadFile">Download</button> -->
    <!-- <textarea v-model="downloaded"></textarea> -->
  </div>
</template>

<script>
import * as Pulse from '../Data/Pulse.js'
export default {
  props: {
    spaceID: {},
    box: {}
  },
  data () {
    return {
      status: '',
      downloaded: false
    }
  },
  info: {
    size: { width: 250, height: 250 }
  },
  methods: {
    onFileSelectChange (evt) {
      this.uploadFile(evt)
    },
    uploadFile (evt) {
      Promise.resolve(evt.target.files[0])
        .then((fileData) => {
          console.log(fileData)
          return Pulse.onUploadFile({
            spaceID: this.spaceID,
            fileID: this.box.id,
            fileData,
            onUploadProgress: (progressEvent) => {
              this.box.data.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            }
          })
        })
        .then(() => {
          this.box.data.link = Pulse.getDownloadLink({ fileID: this.box.id, spaceID: this.spaceID })
          this.$emit('pulse-update')
          this.$forceUpdate()
        })
    },
    downloadFile () {
      // return Pulse.onDownloadFile({ spaceID: this.spaceID, fileID: this.box.data.fileID })
      //   .then((data) => {
      //     // this.downloaded = data
      //     this.downloadAction(data)
      //   })
    },
    base64MimeType (encoded) {
      var result = null

      if (typeof encoded !== 'string') {
        return result
      }

      var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)

      if (mime && mime.length) {
        result = mime[1]
      }

      return result
    },
    urlsafeb64_to_b64 (s) {
      // Replace - with + and _ with /
      return s.replace(/-/g, '+').replace(/_/g, '/')
    },
    downloadAction (url, fileName) {
      // var extension = this.base64MimeType(url).replace('image/', '')
      // url = url.replace(/^data:image\/[^;]+/, 'data:application/octet-stream')

      // var dataStr = url
      // var newBlobURL = URL.createObjectURL(new Blob([dataStr], { type: 'text/json' }))
      var dlAnchorElem = document.createElement('a')
      dlAnchorElem.setAttribute('href', url)
      // dlAnchorElem.setAttribute('_target', 'blank')
      dlAnchorElem.setAttribute('download', fileName)
      dlAnchorElem.click()
    },
    readDataURI (evt) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader()
        reader.onload = (evt) => {
          try {
            resolve(reader.result)
          } catch (e) {
            console.log(e)
          }
        }
        if (evt.target.files[0]) {
          reader.readAsDataURL(evt.target.files[0])
        }
      })
    }
  }
}
</script>

<style scoped>
  .box{
    width: 100%;
    height: 100%;
  }
</style>
