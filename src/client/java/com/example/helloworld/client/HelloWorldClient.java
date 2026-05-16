/**
 * 이 파일은 클라이언트 전용 진입점입니다.
 * <p>
 * Fabric은 물리 클라이언트에서만 {@link net.fabricmc.api.ClientModInitializer}를
 * 로드하고 {@link #onInitializeClient()}를 호출합니다. 전용 서버(dedicated server)에는
 * 이 코드가 포함되지 않습니다. 현재 모드는 실제 기능을
 * {@code com.example.helloworld.client.mixin.MinecraftClientMixin}에 두었으므로,
 * 이 클래스는 향후 키바인딩·렌더링 등 클라이언트 전용 설정을 넣을 때의 확장 지점입니다.
 */
package com.example.helloworld.client;

import net.fabricmc.api.ClientModInitializer;

public class HelloWorldClient implements ClientModInitializer {
	/**
	 * 클라이언트 측 초기화 훅입니다. 마인크래프트 클라이언트가 Mod 초기화 단계에 들어올 때
	 * 한 번 호출됩니다. 지금은 Mixin이 메인 로직을 담당하므로 본문은 비어 있습니다.
	 */
	@Override
	public void onInitializeClient() {
		// 필요 시: 클라이언트 리소스 리로더 등록, HUD, 키 매핑 등을 여기에 둡니다.
	}
}