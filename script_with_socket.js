<\script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import gameApi from '../api/game';
import socketService from '../api/socket';
import { showToast, showConfirmDialog } from 'vant';
import { getCurrentUser } from '../store/user';
