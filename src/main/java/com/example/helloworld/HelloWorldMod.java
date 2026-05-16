/**
 * 이 파일은 모드의 공통(서버·클라이언트 모두) 진입점입니다.
 * <p>
 * Fabric이 게임을 초기화할 때 {@link net.fabricmc.api.ModInitializer} 구현체의
 * {@link #onInitialize()}를 한 번 호출합니다. 클라이언트 전용 초기화는
 * {@code HelloWorldClient}에서 처리하고, 본 모드의 핵심 동작(좌클릭 시 채팅)은
 * Mixin으로 구현되어 있어 이 클래스는 로드 확인용 로그만 남깁니다.
 */
package com.example.helloworld;

import net.fabricmc.api.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HelloWorldMod implements ModInitializer {
	/**
	 * 모드의 고유 식별자입니다. {@code fabric.mod.json}의 {@code id}와 반드시 같아야 하며,
	 * 로거 이름·설정 키 등에서 모드를 구분하는 데 쓰입니다.
	 */
	public static final String MOD_ID = "helloworld";

	/**
	 * SLF4J 로거입니다. {@code MOD_ID}를 로거 이름으로 등록해 콘솔·로그 파일에
	 * {@code [helloworld]} 형태로 어느 모드가 출력했는지 구분하기 쉽게 합니다.
	 */
	public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

	/**
	 * 공통 초기화 콜백입니다. 리소스 로딩 직후 등 일부 서브시스템은 아직 준비되지 않을 수 있어,
	 * 무거운 작업보다는 짧은 초기화·로그 정도만 두는 것이 관례입니다.
	 */
	@Override
	public void onInitialize() {
		// 모드 JAR가 정상 로드되었는지 확인하기 위한 한 줄 로그입니다.
		LOGGER.info("Hello World mod loaded");
	}
}
