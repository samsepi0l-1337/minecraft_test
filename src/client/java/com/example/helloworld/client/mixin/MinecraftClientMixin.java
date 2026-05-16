/**
 * 이 파일은 Mixin을 통해 바닐라 클래스의 동작에 코드를 끼워 넣습니다.
 * <p>
 * 연동 설정 파일: {@code src/client/resources/helloworld.client.mixins.json}
 * (JSON 표준에는 주석이 없어, 각 필드 설명은 이 JavaDoc에 적습니다.)
 * <ul>
 *   <li>{@code required}: true이면 설정 파일이 없거나 깨지면 로드를 중단합니다.</li>
 *   <li>{@code package}: Mixin 클래스들이 위치한 Java 패키지 접두사입니다.</li>
 *   <li>{@code compatibilityLevel}: Mixin이 가정하는 Java 언어 레벨(바이트코드/문법 호환)입니다.</li>
 *   <li>{@code client}: 클라이언트 전용으로 로드할 Mixin 클래스 단순 이름 배열입니다.</li>
 *   <li>{@code injectors.defaultRequire}: {@code @Inject}에 {@code require}를 생략했을 때의 기본값으로,
 *       최소 몇 개의 주입 지점이 매칭되어야 하는지 정합니다(예: 1이면 하나도 못 찾으면 실패).</li>
 *   <li>{@code overwrites.requireAnnotations}: {@code @Overwrite} 사용을 제한해 실수로 덮어쓰기 하는 것을 방지합니다.</li>
 * </ul>
 * 공식 Mojang 매핑 기준 클라이언트 메인 클래스 이름은 {@link net.minecraft.client.Minecraft}이며,
 * 좌클릭(공격) 처리 진입점 메서드는 {@code startAttack}입니다 (Yarn 등 다른 매핑에서는 이름이 다를 수 있음).
 */
package com.example.helloworld.client.mixin;

import net.minecraft.client.Minecraft;
import net.minecraft.network.chat.Component;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * 바닐라 {@link Minecraft}에 주입되는 Mixin 클래스입니다.
 * {@code @Mixin}의 대상은 바이트코드 레벨에서 수정할 클래스입니다.
 */
@Mixin(Minecraft.class)
public class MinecraftClientMixin {
	/**
	 * {@code startAttack} 메서드가 실행되기 직전(HEAD)에 이 콜백이 먼저 실행됩니다.
	 * <ul>
	 *   <li>{@code method}: Mojang 매핑에서의 대상 메서드 이름입니다.</li>
	 *   <li>{@code at = @At("HEAD")}: 메서드 본문의 맨 앞, 원래 로직보다 먼저 실행됩니다.</li>
	 * </ul>
	 * 반환값이 있는 메서드이므로 콜백 타입은 {@link CallbackInfoReturnable}이며,
	 * 제네릭 {@code Boolean}은 원래 메서드의 반환 타입과 맞춥니다.
	 *
	 * @param cir Mixin이 제공하는 콜백 객체입니다. {@code cancel()} 등으로 원래 메서드를 중단할 수 있으나,
	 *            여기서는 사용하지 않고 원래 공격 로직이 그대로 이어지게 둡니다.
	 */
	@Inject(method = "startAttack", at = @At("HEAD"))
	// 메서드 이름의 helloworld$ 접두사: 여러 모드가 같은 클래스에 Mixin할 때 이름 충돌을 줄이는 관례입니다.
	private void helloworld$onLeftClick(CallbackInfoReturnable<Boolean> cir) {
		// Mixin 대상 인스턴스(this)는 Mixin 서브클래스이므로, 실제 타입인 Minecraft로 캐스팅합니다.
		Minecraft client = (Minecraft) (Object) this;

		// 메인 메뉴·로딩 중 등 플레이어가 아직 없으면 메시지를 보낼 수 없으므로 즉시 반환합니다.
		if (client.player == null) {
			return;
		}

		// displayClientMessage: 서버로 보내지 않고 로컬 플레이어 화면에만 표시되는 채팅입니다.
		// Component.literal: 고정 문자열을 채팅 컴포넌트로 만듭니다.
		// 두 번째 인자 false: 액션바가 아니라 일반 채팅 HUD에 출력합니다(true면 액션바).
		client.player.displayClientMessage(Component.literal("hello world"), false);
	}
}
